using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Response;
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

        public CartService(ICartRepository cartRepository, IUnitOfWork unitOfWork, ICartItemRepository cartItemRepository)
        {
            _cartRepository = cartRepository;
            _unitOfWork = unitOfWork;
            _cartItemRepository = cartItemRepository;
        }
        public async Task<CartDto> AddItemAsync(Guid customerId, Guid? productVariantId, Guid? lensesVariantId, Guid? comboItemId, Guid? serviceId, Guid? slotId, int quantity, string? note)
        {
            var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId);
            if (cart == null)
            {
                throw new Exception("Bạn chưa có giỏ hàng.");
            }

            // Tính UnitPrice dựa theo loại item được chọn
            decimal unitPrice = 0;

            if (productVariantId.HasValue)
            {
                var productVariant = await _unitOfWork.GetRepository<ProductVariant>()
                    .GetByIdAsync(productVariantId.Value);
                unitPrice += productVariant?.Price ?? 0;
            }

            if (lensesVariantId.HasValue)
            {
                var lensVariant = await _unitOfWork.GetRepository<LensVariant>()
                    .GetByIdAsync(lensesVariantId.Value);
                unitPrice += lensVariant?.Price ?? 0;
            }

            if (comboItemId.HasValue)
            {
                var comboItem = await _unitOfWork.GetRepository<ComboItem>()
                    .GetByIdAsync(comboItemId.Value);
                // Lấy giá BasePrice từ Combo cha
                var combo = comboItem != null
                    ? await _unitOfWork.GetRepository<Combo>()
                        .GetByIdAsync(comboItem.ComboId)
                    : null;
                unitPrice += combo?.BasePrice ?? 0;
            }

            if (serviceId.HasValue)
            {
                var service = await _unitOfWork.GetRepository<Service>()
                    .GetByIdAsync(serviceId.Value);
                unitPrice += service?.Price ?? 0;
            }

            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductVariantId = productVariantId,
                LensesVariantId = lensesVariantId,
                ComboItemId = comboItemId,
                ServiceId = serviceId,
                SlotId = slotId,
                Quantity = quantity,
                UnitPrice = unitPrice,
                Note = note
            };

            cart.CartItems.Add(cartItem);

            // Cập nhật TotalAmount của Cart
            cart.TotalAmount = cart.CartItems.Sum(x => x.UnitPrice * x.Quantity);
            _cartRepository.Update(cart);

            await _cartItemRepository.AddAsync(cartItem);
            await _unitOfWork.SaveChangesAsync();

            return new CartDto
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

        public async Task<CartDto> CreateCartIfNotExistsAsync(Guid customerId)
        {
            var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId);
            if (cart != null)
            {
                return new CartDto
                {
                    Id = cart.Id,
                    CustomerId = cart.CustomerId,
                    TotalAmount = cart.TotalAmount,
                    Status = cart.Status,
                    CreatedAt= cart.CreatedAt,
                    CartItems = cart.CartItems.Select(x => new CartItemDto
                    {
                        Id = x.Id,
                        CartId= x.CartId,
                        ProductVariantId = x.ProductVariantId,
                        LensesVariantId= x.LensesVariantId,
                        ComboItemId = x.ComboItemId,
                        ServiceId = x.ServiceId,
                        SlotId = x.SlotId,
                        Quantity = x.Quantity,
                        UnitPrice = x.UnitPrice,
                        Note = x.Note
                    }).ToList()
                };
            }

            var newCart = new Cart
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                TotalAmount = 0,
                Status = "Pending",
                CreatedAt = DateTime.Now,
                CartItems = new List<CartItem>()
            };

            await _cartRepository.AddAsync(newCart);
            await _unitOfWork.SaveChangesAsync();

            return new CartDto
            {
                Id = newCart.Id,
                CustomerId = newCart.CustomerId,
                TotalAmount = newCart.TotalAmount,
                Status = newCart.Status,
                CreatedAt = newCart.CreatedAt,
                CartItems = newCart.CartItems.Select(x => new CartItemDto
                {
                    Id = x.Id,
                    CartId = x.CartId,
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

        public async Task<CartDto?> GetCartByCustomerIdAsync(Guid customerId)
        {
            var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId);
            if (cart == null)
            {
                throw new Exception("Bạn chưa có giỏ hàng.");
            }

            return new CartDto
            {
                Id = cart.Id,
                CustomerId = cart.CustomerId,
                TotalAmount = cart.TotalAmount,
                Status = cart.Status,
                CreatedAt = cart.CreatedAt,
                CartItems = cart.CartItems.Select(x => new CartItemDto
                {
                    Id = x.Id,
                    CartId = x.CartId,
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

        public async Task<bool> RemoveItemAsync(Guid cartItemId)
        {
            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
            {
                return false;
            }

            _cartItemRepository.Delete(cartItem);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<CartDto> UpdateItemQuantityAsync(Guid cartItemId, int quantity)
        {
            var cart = await _cartRepository.GetCartByCartItemIdAsync(cartItemId);
            if (cart == null)
            {
                throw new Exception("Bạn chưa có giỏ hàng.");
            }

            var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (cartItem == null)
            {
                throw new Exception("Bạn không có sản phẩm này");
            }

            if (quantity == 0)
            {
                throw new Exception("Số lượng không được bằng 0.");
            }

            cartItem.Quantity = quantity;
            _cartItemRepository.Update(cartItem);
            await _unitOfWork.SaveChangesAsync();

            return new CartDto
            {
                Id = cart.Id,
                CustomerId = cart.CustomerId,
                TotalAmount = cart.TotalAmount,
                Status = cart.Status,
                CreatedAt = cart.CreatedAt,
                CartItems = cart.CartItems.Select(x => new CartItemDto
                {
                    Id = x.Id,
                    CartId = x.CartId,
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
}
