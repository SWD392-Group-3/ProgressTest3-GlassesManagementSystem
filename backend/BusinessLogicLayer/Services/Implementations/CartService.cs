using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly ICustomerRepository _customerRepository;

        public CartService(ICartRepository cartRepository, IUnitOfWork unitOfWork, ICartItemRepository cartItemRepository, ICustomerRepository customerRepository)
        {
            _cartRepository = cartRepository;
            _unitOfWork = unitOfWork;
            _cartItemRepository = cartItemRepository;
            _customerRepository = customerRepository;
        }

        /// <summary>
        /// Nhận vào userId (từ JWT), trả về Customer.Id thực trong DB.
        /// Nếu không tìm thấy Customer tương ứng, throw exception.
        /// </summary>
        private async Task<Guid> ResolveCustomerIdAsync(Guid userId)
        {
            // Thử tìm theo Customer.Id trực tiếp trước
            var byId = await _customerRepository.GetByIdAsync(userId);
            if (byId != null)
                return byId.Id;

            // Nếu không tìm thấy theo Id, tìm theo UserId (FK)
            var byUserId = await _customerRepository.GetByUserIdAsync(userId);
            if (byUserId != null)
                return byUserId.Id;

            throw new Exception("Customer not found.");
        }

        public async Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request)
        {
            var customerId = await ResolveCustomerIdAsync(userId);
            
            // Tự tạo cart nếu chưa có
            var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId);
            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    CustomerId = customerId,
                    TotalAmount = 0,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    CartItems = new List<CartItem>()
                };
                await _cartRepository.AddAsync(cart);
                await _unitOfWork.SaveChangesAsync();
            }

            // Tính UnitPrice dựa theo loại item được chọn
            decimal unitPrice = 0;

            if (request.ProductId.HasValue && !request.ProductVariantId.HasValue)
            {
                var product = await _unitOfWork.GetRepository<Product>()
                    .GetByIdAsync(request.ProductId.Value);
                unitPrice += product?.UnitPrice ?? 0;
            }

            if (request.ProductVariantId.HasValue)
            {
                var productVariant = await _unitOfWork.GetRepository<ProductVariant>()
                    .GetByIdAsync(request.ProductVariantId.Value);
                unitPrice += productVariant?.Price ?? 0;
            }

            if (request.LensesVariantId.HasValue)
            {
                var lensVariant = await _unitOfWork.GetRepository<LensVariant>()
                    .GetByIdAsync(request.LensesVariantId.Value);
                unitPrice += lensVariant?.Price ?? 0;
            }

            if (request.ComboItemId.HasValue)
            {
                var comboItem = await _unitOfWork.GetRepository<ComboItem>()
                    .GetByIdAsync(request.ComboItemId.Value);
                var combo = comboItem != null
                    ? await _unitOfWork.GetRepository<Combo>()
                        .GetByIdAsync(comboItem.ComboId)
                    : null;
                unitPrice += combo?.BasePrice ?? 0;
            }

            if (request.ServiceId.HasValue)
            {
                var service = await _unitOfWork.GetRepository<Service>()
                    .GetByIdAsync(request.ServiceId.Value);
                unitPrice += service?.Price ?? 0;
            }

            // Khi chọn dịch vụ kèm slot: kiểm tra slot tồn tại và còn trống
            if (request.SlotId.HasValue)
            {
                var slot = await _unitOfWork.GetRepository<Slot>()
                    .GetByIdAsync(request.SlotId.Value);
                if (slot == null)
                    throw new Exception("Slot does not exist.");
                var isAvailable = slot.Status == null || slot.Status == "Available";
                if (!isAvailable)
                    throw new Exception("This slot is no longer available. Please choose another.");
                if (slot.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                    throw new Exception("Cannot book a slot in the past.");
            }

            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = request.ProductId,
                ProductVariantId = request.ProductVariantId,
                LensesVariantId = request.LensesVariantId,
                ComboItemId = request.ComboItemId,
                ServiceId = request.ServiceId,
                SlotId = request.SlotId,
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
                Note = request.Note
            };

            cart.CartItems.Add(cartItem);

            await _cartItemRepository.AddAsync(cartItem);
            cart.TotalAmount = cart.CartItems.Sum(x => x.UnitPrice * x.Quantity);
            _cartRepository.Update(cart);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(cart, customerId);
        }

        public async Task<CartDto> CreateCartIfNotExistsAsync(Guid userId)
        {
            var customerId = await ResolveCustomerIdAsync(userId);

            var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId);
            if (cart != null)
                return MapToDto(cart, customerId);

            var newCart = new Cart
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                TotalAmount = 0,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                CartItems = new List<CartItem>()
            };

            await _cartRepository.AddAsync(newCart);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(newCart, customerId);
        }

        public async Task<CartDto?> GetCartByCustomerIdAsync(Guid userId)
        {
            var customerId = await ResolveCustomerIdAsync(userId);

            var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId);
            if (cart == null)
            {
                return await CreateCartIfNotExistsAsync(userId);
            }

            return MapToDto(cart, customerId);
        }

        public async Task<bool> RemoveItemAsync(Guid cartItemId)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
                return false;

            _cartItemRepository.Delete(cartItem);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<CartDto> UpdateItemQuantityAsync(Guid cartItemId, int quantity)
        {
            var cart = await _cartRepository.GetCartByCartItemIdAsync(cartItemId);
            if (cart == null)
                throw new Exception("You do not have a cart yet.");

            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
                throw new Exception("This item is not in your cart.");

            if (quantity == 0)
                throw new Exception("Quantity cannot be zero.");

            cartItem.Quantity = quantity;
            _cartItemRepository.Update(cartItem);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(cart, cart.CustomerId);
        }

        private static CartDto MapToDto(Cart cart, Guid customerId) => new CartDto
        {
            Id = cart.Id,
            CustomerId = customerId,
            TotalAmount = cart.TotalAmount,
            Status = cart.Status,
            CreatedAt = cart.CreatedAt,
            CartItems = cart.CartItems.Select(x => new CartItemDto
            {
                Id = x.Id,
                CartId = x.CartId,
                ProductId = x.ProductId,
                ProductVariantId = x.ProductVariantId,
                LensesVariantId = x.LensesVariantId,
                ComboItemId = x.ComboItemId,
                ServiceId = x.ServiceId,
                SlotId = x.SlotId,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                Note = x.Note
            }).ToList()
        };
    }
}
