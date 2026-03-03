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
        private readonly IUserRepository _userRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IPromotionRepository _promotionRepository;
        private readonly ICustomerRepository _customerRepository;

        public OrderService(
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            IOrderItemRepository orderItemRepository,
            IUserRepository userRepository,
            ICartRepository cartRepository,
            ICartItemRepository cartItemRepository,
            IPromotionRepository promotionRepository,
            ICustomerRepository customerRepository
        )
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _orderItemRepository = orderItemRepository;
            _userRepository = userRepository;
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _promotionRepository = promotionRepository;
            _customerRepository = customerRepository;
        }

        public async Task<bool> CancelOrderAsync(Guid orderId, Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var order = await _orderRepository.GetByIdAndUserIdAsync(orderId, userId);
            if (order == null)
            {
                return false;
            }

            order.Status = "Cancelled";

            _orderRepository.Update(order);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<OrderDto> CreateFromCartAsync(Guid customerId, CreateOrderRequest request)
        {
            var user = await _userRepository.GetByIdAsync(customerId);
            if (user == null)
            {
                throw new Exception("Tài khoản không tồn tại.");
            }

            // FIX 1: Dùng GetCartWithItemsAsync để Include CartItems
            var cart = await _cartRepository.GetCartWithItemsAsync(request.CartId);
            if (cart == null || !cart.CartItems.Any())
            {
                throw new Exception("Giỏ hàng rỗng.");
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                PromotionId = request.PromotionId,
                Status = "Pending",
                OrderDate = DateTime.UtcNow,
                ShippingAddress = request.ShippingAddress,
                ShippingPhone = request.ShippingPhone,
                OrderItems = new List<OrderItem>(),
            };

            foreach (var item in cart.CartItems)
            {
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
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
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                ShippingPhone = order.ShippingPhone,
                Note = order.Note,
                OrderItems = order
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
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
                throw new Exception("Khách hàng không tồn tại.");

            if (request.Items == null || !request.Items.Any())
                throw new Exception("Phải có ít nhất 1 sản phẩm.");

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
                    item.ProductVariantId == null
                    && item.LensesVariantId == null
                    && item.ComboItemId == null
                    && item.ServiceId == null
                )
                    throw new Exception(
                        "Mỗi item phải có ít nhất một sản phẩm, tròng kính, combo hoặc dịch vụ."
                    );

                // Tính UnitPrice từ DB
                decimal unitPrice = 0;

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
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                ShippingPhone = order.ShippingPhone,
                Note = order.Note,
                OrderItems = order
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
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
                OrderDate = o.OrderDate,
                ShippingAddress = o.ShippingAddress,
                ShippingPhone = o.ShippingPhone,
                Note = o.Note,
                OrderItems = o
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
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

        public async Task<IEnumerable<OrderDto>> GetByCustomerAsync(Guid customerId)
        {
            var orders = await _orderRepository.GetByCustomerIdAsync(customerId);

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                PromotionId = o.PromotionId,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                DiscountAmount = o.DiscountAmount,
                OrderDate = o.OrderDate,
                ShippingAddress = o.ShippingAddress,
                ShippingPhone = o.ShippingPhone,
                Note = o.Note,
                OrderItems = o
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
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
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                ShippingPhone = order.ShippingPhone,
                Note = order.Note,
                OrderItems = order
                    .OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
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

        public async Task<bool> UpdateStatusAsync(Guid orderId, string newStatus)
        {
            var validStatuses = new[]
            {
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
            };
            if (!validStatuses.Contains(newStatus))
                throw new Exception($"Trạng thái '{newStatus}' không hợp lệ.");

            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
                return false;

            // Không cho phép cập nhật đơn đã huỷ hoặc đã giao
            if (order.Status == "Cancelled" || order.Status == "Delivered")
                throw new Exception(
                    $"Không thể thay đổi trạng thái đơn hàng đang ở '{order.Status}'."
                );

            order.Status = newStatus;
            _orderRepository.Update(order);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
