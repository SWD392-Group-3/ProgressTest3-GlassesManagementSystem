using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IReturnExchangeHistoryRepository : IGenericRepository<ReturnExchangeHistory>
    {
        Task<IEnumerable<ReturnExchangeHistory>> GetByReturnExchangeIdAsync(Guid returnExchangeId);
        Task<IEnumerable<ReturnExchangeHistory>> GetByUserIdAsync(Guid userId);
    }
}
