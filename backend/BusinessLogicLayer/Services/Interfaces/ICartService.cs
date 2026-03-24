using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.DTOs.Request;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto?> GetCartByCustomerIdAsync(Guid customerId);
        Task<CartDto> CreateCartIfNotExistsAsync(Guid customerId);

        // CartItem
        Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request);

        Task<CartDto> UpdateItemQuantityAsync(Guid cartItemId, int quantity);
        Task<bool> RemoveItemAsync(Guid cartItemId);
    }
}
