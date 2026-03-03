using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IOrderService
    {
        // Create
        Task<OrderDto> CreateFromCartAsync(Guid userId, CreateOrderRequest request);
        Task<OrderDto> CreateManualOrderAsync(CreateManualOrderRequest request);

        // Read
        Task<OrderDto?> GetByIdAsync(Guid orderId);
        Task<IEnumerable<OrderDto>> GetByCustomerAsync(Guid userId);
        Task<IEnumerable<OrderDto>> GetAllAsync();

        // Status
        Task<bool> UpdateStatusAsync(Guid orderId, string newStatus);
        Task<bool> ConfirmOrderAsync(Guid orderId);
        Task<bool> RejectOrderAsync(Guid orderId, string? reason);
        Task<bool> CancelOrderAsync(Guid orderId, Guid userId);
    }
}
