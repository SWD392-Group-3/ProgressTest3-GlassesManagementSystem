using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto?> GetCartByCustomerIdAsync(Guid customerId);
        Task<CartDto> CreateCartIfNotExistsAsync(Guid customerId);

        // CartItem
        Task<CartDto> AddItemAsync(
            Guid customerId,
            Guid? productVariantId,
            Guid? lensesVariantId,
            Guid? comboItemId,
            Guid? serviceId,
            Guid? slotId,
            int quantity,
            string? note
        );

        Task<CartDto> UpdateItemQuantityAsync(Guid cartItemId, int quantity);
        Task<bool> RemoveItemAsync(Guid cartItemId);
    }
}
