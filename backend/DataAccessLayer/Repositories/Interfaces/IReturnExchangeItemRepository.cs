using System.Collections.Generic;
using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IReturnExchangeItemRepository : IGenericRepository<ReturnExchangeItem>
    {
        Task<IEnumerable<ReturnExchangeItem>> GetByReturnExchangeIdAsync(Guid returnExchangeId);
        Task<IEnumerable<ReturnExchangeItem>> GetByOrderItemIdAsync(Guid orderItemId);
        Task<ReturnExchangeItem?> GetByIdWithOrderItemDetailsAsync(Guid id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Tổng số lượng đã nhận hoàn (Received) theo từng OrderItemId, chỉ phiếu Completed của đơn hàng.
        /// </summary>
        Task<IReadOnlyDictionary<Guid, int>> GetReceivedQuantityByOrderItemForCompletedReturnsAsync(
            Guid orderId,
            CancellationToken cancellationToken = default);
    }
}
