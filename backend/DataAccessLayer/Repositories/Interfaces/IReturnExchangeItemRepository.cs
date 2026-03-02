using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IReturnExchangeItemRepository : IGenericRepository<ReturnExchangeItem>
    {
        Task<IEnumerable<ReturnExchangeItem>> GetByReturnExchangeIdAsync(Guid returnExchangeId);
        Task<IEnumerable<ReturnExchangeItem>> GetByOrderItemIdAsync(Guid orderItemId);
    }
}
