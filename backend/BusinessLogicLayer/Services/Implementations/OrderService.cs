using System.Collections.Generic;
using System.Linq;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IPromotionRepository _promotionRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly INotificationService _notificationService;

        public OrderService(
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            IOrderItemRepository orderItemRepository,
            ICartRepository cartRepository,
            ICartItemRepository cartItemRepository,
            IPromotionRepository promotionRepository,
            ICustomerRepository customerRepository,
            INotificationService notificationService
        )
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _orderItemRepository = orderItemRepository;
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _promotionRepository = promotionRepository;
            _customerRepository = customerRepository;
            _notificationService = notificationService;
        }

        public async Task<bool> CancelOrderAsync(Guid orderId, Guid userId)
        {
            var customer = await _customerRepository.GetByUserIdAsync(userId);
            if (customer == null)
                return false;

            var order = await _orderRepository.GetByIdAndUserIdAsync(orderId, customer.Id);
            if (order == null)
                return false;

            if (order.Status != "Pending")
            {
                throw new Exception("Order can only be cancelled when status is Pending.");
            }

            order.Status = "Cancelled";
            _orderRepository.Update(order);

            // Load OrderItems để trả slot về Available
            var orderWithItems = await _orderRepository.GetByIdWithItemsAsync(orderId);
            if (orderWithItems?.OrderItems != null && orderWithItems.OrderItems.Any())
                await SetSlotStatusByOrderItemsAsync(orderWithItems.OrderItems.ToList(), "Available");

            await _unitOfWork.SaveChangesAsync();

            // Thông báo real-time
            await _notificationService.SendOrderStatusChangedAsync(order.CustomerId, orderId, "Cancelled");

            return true;
        }

        public async Task<OrderDto> CreateFromCartAsync(Guid userId, CreateOrderRequest request)
        {
            var customer = await _customerRepository.GetByUserIdAsync(userId);
            if (customer == null)
                throw new Exception("Account not found.");

            // FIX 1: Dùng GetCartWithItemsAsync để Include CartItems
            var cart = await _cartRepository.GetCartWithItemsAsync(request.CartId);
            if (cart == null || !cart.CartItems.Any())
            {
                throw new Exception("Cart is empty.");
            }

            // Đơn chỉ dịch vụ + slot: không yêu cầu giao hàng và không áp mã khuyến mãi
            var isServiceOnlyOrder = cart.CartItems.All(i =>
                i.ServiceId != null
                && i.ProductId == null
                && i.ProductVariantId == null
                && i.LensesVariantId == null
                && i.ComboItemId == null);

            if (!isServiceOnlyOrder)
            {
                if (string.IsNullOrWhiteSpace(request.ShippingAddress))
                    throw new Exception("Please enter shipping address.");
                if (string.IsNullOrWhiteSpace(request.ShippingPhone))
                    throw new Exception("Please enter shipping phone number.");
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                PromotionId = isServiceOnlyOrder ? null : request.PromotionId,
                Status = "Pending",
                OrderDate = DateTime.UtcNow,
                ShippingAddress = isServiceOnlyOrder ? null : (request.ShippingAddress ?? ""),
                ShippingPhone = isServiceOnlyOrder ? null : (request.ShippingPhone ?? ""),
                OrderItems = new List<OrderItem>(),
                Note = request.Note,
            };

            foreach (var item in cart.CartItems)
            {
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    ProductVariantId = item.ProductVariantId,
                    LensesVariantId = item.LensesVariantId,
                    ComboItemId = item.ComboItemId,
                    ServiceId = item.ServiceId,
                    SlotId = item.SlotId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice,
                    Note = item.Note,
                };
                order.OrderItems.Add(orderItem);
            }

            order.TotalAmount = order.OrderItems.Sum(oi => oi.TotalPrice);

            // FIX 4: DiscountValue là % (0-100) → chia 100 trước khi nhân
            if (order.PromotionId != null)
            {
                var promotion = await _promotionRepository.GetByIdAsync(order.PromotionId.Value);
                if (promotion != null)
                {
                    order.DiscountAmount = order.TotalAmount * (promotion.DiscountValue / 100m);
                }
            }

            // FIX 2 & 3: Add order + orderItems cùng lúc, gọi Update để persist TotalAmount/DiscountAmount
            await _orderRepository.AddAsync(order);
            _cartItemRepository.RemoveRange(cart.CartItems);
            await _unitOfWork.SaveChangesAsync();

            return new OrderDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                PromotionId = order.PromotionId,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.TotalAmount - order.DiscountAmount,
                PaymentStatus = null,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                ShippingPhone = order.ShippingPhone,
                Note = order.Note,
                Status = order.Status,
                OrderItems = order
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        ProductVariantId = oi.ProductVariantId,
                        LensesVariantId = oi.LensesVariantId,
                        ComboItemId = oi.ComboItemId,
                        ServiceId = oi.ServiceId,
                        SlotId = oi.SlotId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        Note = oi.Note,
                    })
                    .ToList(),
            };
        }

        public async Task<OrderDto> CreateManualOrderAsync(CreateManualOrderRequest request)
        {
            var customer = await _customerRepository.GetByUserIdAsync(request.CustomerId);
            if (customer == null)
                throw new Exception("Customer not found.");

            if (request.Items == null || !request.Items.Any())
                throw new Exception("At least one product is required.");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                PromotionId = request.PromotionId,
                Status = "Pending",
                OrderDate = DateTime.UtcNow,
                ShippingAddress = request.ShippingAddress,
                ShippingPhone = request.ShippingPhone,
                Note = request.Note,
                OrderItems = new List<OrderItem>(),
            };

            foreach (var item in request.Items)
            {
                // Phải chọn ít nhất 1 loại
                if (
                    item.ProductId == null
                    && item.ProductVariantId == null
                    && item.LensesVariantId == null
                    && item.ComboItemId == null
                    && item.ServiceId == null
                )
                    throw new Exception(
                        "Each item must have at least one product, lenses, combo or service."
                    );

                // Tính UnitPrice từ DB
                decimal unitPrice = 0;

                if (item.ProductId.HasValue && !item.ProductVariantId.HasValue)
                {
                    var product = await _unitOfWork
                        .GetRepository<DataAccessLayer.Database.Entities.Product>()
                        .GetByIdAsync(item.ProductId.Value);
                    unitPrice += product?.UnitPrice ?? 0;
                }

                if (item.ProductVariantId.HasValue)
                {
                    var variant = await _unitOfWork
                        .GetRepository<DataAccessLayer.Database.Entities.ProductVariant>()
                        .GetByIdAsync(item.ProductVariantId.Value);
                    unitPrice += variant?.Price ?? 0;
                }

                if (item.LensesVariantId.HasValue)
                {
                    var lens = await _unitOfWork
                        .GetRepository<DataAccessLayer.Database.Entities.LensVariant>()
                        .GetByIdAsync(item.LensesVariantId.Value);
                    unitPrice += lens?.Price ?? 0;
                }

                if (item.ComboItemId.HasValue)
                {
                    var comboItem = await _unitOfWork
                        .GetRepository<DataAccessLayer.Database.Entities.ComboItem>()
                        .GetByIdAsync(item.ComboItemId.Value);
                    if (comboItem != null)
                    {
                        var combo = await _unitOfWork
                            .GetRepository<DataAccessLayer.Database.Entities.Combo>()
                            .GetByIdAsync(comboItem.ComboId);
                        unitPrice += combo?.BasePrice ?? 0;
                    }
                }

                if (item.ServiceId.HasValue)
                {
                    var service = await _unitOfWork
                        .GetRepository<DataAccessLayer.Database.Entities.Service>()
                        .GetByIdAsync(item.ServiceId.Value);
                    unitPrice += service?.Price ?? 0;
                }

                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    ProductVariantId = item.ProductVariantId,
                    LensesVariantId = item.LensesVariantId,
                    ComboItemId = item.ComboItemId,
                    ServiceId = item.ServiceId,
                    SlotId = item.SlotId,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = unitPrice * item.Quantity,
                    Note = item.Note,
                };

                order.OrderItems.Add(orderItem);
            }

            order.TotalAmount = order.OrderItems.Sum(oi => oi.TotalPrice);

            if (order.PromotionId != null)
            {
                var promotion = await _promotionRepository.GetByIdAsync(order.PromotionId.Value);
                if (promotion != null)
                    order.DiscountAmount = order.TotalAmount * (promotion.DiscountValue / 100m);
            }

            await _orderRepository.AddAsync(order);
            await _unitOfWork.SaveChangesAsync();

            return new OrderDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                PromotionId = order.PromotionId,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.TotalAmount - order.DiscountAmount,
                PaymentStatus = null,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                ShippingPhone = order.ShippingPhone,
                Note = order.Note,
                OrderItems = order
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        ProductVariantId = oi.ProductVariantId,
                        LensesVariantId = oi.LensesVariantId,
                        ComboItemId = oi.ComboItemId,
                        ServiceId = oi.ServiceId,
                        SlotId = oi.SlotId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        Note = oi.Note,
                    })
                    .ToList(),
            };
        }

        public async Task<IEnumerable<OrderDto>> GetAllAsync()
        {
            var orders = await _orderRepository.GetAll();
            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                PromotionId = o.PromotionId,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                DiscountAmount = o.DiscountAmount,
                FinalAmount = o.TotalAmount - o.DiscountAmount,
                PaymentStatus = o.Payments.FirstOrDefault()?.Status,
                OrderDate = o.OrderDate,
                ShippingAddress = o.ShippingAddress,
                ShippingPhone = o.ShippingPhone,
                Note = o.Note,
                OrderItems = o
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        ProductVariantId = oi.ProductVariantId,
                        LensesVariantId = oi.LensesVariantId,
                        ComboItemId = oi.ComboItemId,
                        ServiceId = oi.ServiceId,
                        SlotId = oi.SlotId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        Note = oi.Note,
                    })
                    .ToList(),
            });
        }

        public async Task<IEnumerable<OrderDto>> GetByCustomerAsync(Guid userId)
        {
            var customer = await _customerRepository.GetByUserIdAsync(userId);
            if (customer == null)
                return Enumerable.Empty<OrderDto>();

            var orders = await _orderRepository.GetByCustomerIdAsync(customer.Id);

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                PromotionId = o.PromotionId,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                DiscountAmount = o.DiscountAmount,
                FinalAmount = o.TotalAmount - o.DiscountAmount,
                PaymentStatus = o.Payments.FirstOrDefault()?.Status,
                OrderDate = o.OrderDate,
                ShippingAddress = o.ShippingAddress,
                ShippingPhone = o.ShippingPhone,
                Note = o.Note,
                OrderItems = o
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        ProductVariantId = oi.ProductVariantId,
                        LensesVariantId = oi.LensesVariantId,
                        ComboItemId = oi.ComboItemId,
                        ServiceId = oi.ServiceId,
                        SlotId = oi.SlotId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        Note = oi.Note,
                    })
                    .ToList(),
            });
        }

        public async Task<OrderDto?> GetByIdAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
            if (order == null)
                return null;

            return new OrderDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                PromotionId = order.PromotionId,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.TotalAmount - order.DiscountAmount,
                PaymentStatus = order.Payments.FirstOrDefault()?.Status,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                ShippingPhone = order.ShippingPhone,
                Note = order.Note,
                OrderItems = order
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        ProductVariantId = oi.ProductVariantId,
                        LensesVariantId = oi.LensesVariantId,
                        ComboItemId = oi.ComboItemId,
                        ServiceId = oi.ServiceId,
                        SlotId = oi.SlotId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        Note = oi.Note,
                        ProductName = oi.ProductVariant?.Product?.Name
                            ?? oi.LensesVariant?.Product?.Name
                            ?? oi.ComboItem?.Combo?.Name
                            ?? oi.Service?.Name
                            ?? oi.Product?.Name,
                        ImageUrl = oi.ProductVariant?.ImageUrl
                            ?? oi.ProductVariant?.Product?.ImageUrl
                            ?? oi.LensesVariant?.ImageUrl,
                        SlotDisplay = oi.Slot != null
                            ? $"{oi.Slot.Date:dd/MM/yyyy} {oi.Slot.StartTime:HH:mm} - {oi.Slot.EndTime:HH:mm}"
                            : null,
                    })
                    .ToList(),
            };
        }

        public async Task<bool> UpdateStatusAsync(Guid orderId, string newStatus)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
                return false;

            // Đơn chỉ dịch vụ (không giao hàng): Paid -> Confirmed -> Completed
            var isServiceOrder = string.IsNullOrEmpty(order.ShippingAddress) && string.IsNullOrEmpty(order.ShippingPhone);

            Dictionary<string, string[]> validTransitions;
            if (isServiceOrder)
            {
                validTransitions = new Dictionary<string, string[]>
                {
                    { "Paid", new[] { "Confirmed" } },
                    { "Confirmed", new[] { "Completed" } },
                };
            }
            else
            {
                // Đơn có hàng giao: Paid -> Confirmed -> ... -> Shipped -> Delivered
                validTransitions = new Dictionary<string, string[]>
                {
                    { "Paid", new[] { "Confirmed" } },
                    { "Confirmed", new[] { "ProcessingTemplate", "Shipped" } },
                    { "ProcessingTemplate", new[] { "Manufacturing" } },
                    { "Manufacturing", new[] { "Shipped" } },
                    { "Shipped", new[] { "Delivered" } },
                };
            }

            if (
                !validTransitions.ContainsKey(order.Status!)
                || !validTransitions[order.Status!].Contains(newStatus)
            )
            {
                var flowDesc = isServiceOrder
                    ? "Service order: Paid -> Confirmed -> Completed."
                    : "Delivery order: Paid -> Confirmed -> ProcessingTemplate -> Manufacturing -> Shipped -> Delivered.";
                throw new Exception(
                    $"Cannot transition from '{order.Status}' to '{newStatus}'. Flow: {flowDesc}"
                );
            }

            order.Status = newStatus;
            _orderRepository.Update(order);
            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendOrderStatusChangedAsync(order.CustomerId, orderId, newStatus);

            return true;
        }

        public async Task<bool> ConfirmOrderAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
            if (order == null)
                return false;

            if (order.Status == "Confirmed")
                return true;

            if (order.Status != "Pending" && order.Status != "Paid")
                throw new Exception(
                    "Order can only be confirmed when status is 'Pending' or 'Paid'."
                );

            order.Status = "Confirmed";
            _orderRepository.Update(order);

            // Cập nhật trạng thái slot thành "Booked" khi staff xác nhận đơn (để dashboard manager hiển thị Đã đặt)
            await SetSlotStatusByOrderItemsAsync(order.OrderItems.ToList(), "Booked");

            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendOrderStatusChangedAsync(order.CustomerId, orderId, "Confirmed");

            return true;
        }

        public async Task<bool> RejectOrderAsync(Guid orderId, string? reason)
        {
            var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
            if (order == null)
                return false;

            if (order.Status != "Pending")
                throw new Exception("Order can only be rejected when status is 'Pending'.");

            order.Status = "Rejected";
            if (!string.IsNullOrEmpty(reason))
                order.Note = string.IsNullOrEmpty(order.Note)
                    ? reason
                    : $"{order.Note} | Saler rejecting reason: {reason}";

            _orderRepository.Update(order);

            // Trả slot về trống khi từ chối đơn
            await SetSlotStatusByOrderItemsAsync(order.OrderItems.ToList(), "Available");

            await _unitOfWork.SaveChangesAsync();

            // Thông báo real-time
            await _notificationService.SendOrderStatusChangedAsync(order.CustomerId, orderId, "Rejected");

            return true;
        }

        public async Task<bool> CompleteOrderAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
                return false;

            var customer = await _customerRepository.GetByIdAsync(order.CustomerId);
            if (customer == null || customer.UserId != userId)
                throw new Exception("You do not have permission to confirm this order.");

            // Đơn dịch vụ: có thể hoàn thành từ Confirmed (khách xác nhận) hoặc đã Completed (sales đã đánh dấu → khách xác nhận lại, idempotent)
            var isServiceOrder = string.IsNullOrEmpty(order.ShippingAddress) && string.IsNullOrEmpty(order.ShippingPhone);
            if (isServiceOrder)
            {
                if (order.Status == "Completed")
                {
                    // Sales đã chuyển sang Completed; customer gọi để xác nhận lại → thành công không đổi gì
                    return true;
                }
                if (order.Status != "Confirmed")
                    throw new Exception("Service order can only be confirmed when status is 'Confirmed' or already 'Completed'.");
            }
            else
            {
                if (order.Status != "Delivered")
                    throw new Exception("Delivery can only be confirmed when order status is 'Delivered'.");
            }

            order.Status = "Completed";
            _orderRepository.Update(order);

            // Đơn dịch vụ: đánh dấu slot đã hoàn thành
            if (isServiceOrder)
            {
                var orderWithItems = await _orderRepository.GetByIdWithItemsAsync(orderId);
                if (orderWithItems?.OrderItems != null && orderWithItems.OrderItems.Any())
                    await SetSlotStatusByOrderItemsAsync(orderWithItems.OrderItems.ToList(), "Completed");
            }

            await _unitOfWork.SaveChangesAsync();

            var customerName = customer.FullName ?? "Customer";
            await _notificationService.SendDeliveryConfirmedToOperationAsync(orderId, customerName);

            return true;
        }

        /// <summary>
        /// Cập nhật Status của các Slot được tham chiếu bởi OrderItems (SlotId != null).
        /// Dùng khi xác nhận đơn (Booked), từ chối/hủy (Available), hoàn thành dịch vụ (Completed).
        /// </summary>
        private async Task SetSlotStatusByOrderItemsAsync(IEnumerable<OrderItem> orderItems, string slotStatus)
        {
            var slotIds = orderItems
                .Where(oi => oi.SlotId.HasValue)
                .Select(oi => oi.SlotId!.Value)
                .Distinct()
                .ToList();
            if (slotIds.Count == 0) return;

            var slotRepo = _unitOfWork.GetRepository<Slot>();
            foreach (var slotId in slotIds)
            {
                var slot = await slotRepo.GetByIdAsync(slotId);
                if (slot != null)
                {
                    slot.Status = slotStatus;
                    slotRepo.Update(slot);
                }
            }
        }
    }
}
