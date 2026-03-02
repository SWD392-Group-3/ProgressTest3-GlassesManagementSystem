using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IReturnExchangeImageRepository : IGenericRepository<ReturnExchangeImage>
    {
        Task<IEnumerable<ReturnExchangeImage>> GetByReturnExchangeItemIdAsync(
            Guid returnExchangeItemId
        );
        Task<IEnumerable<ReturnExchangeImage>> GetByRoleAsync(string role);
        Task<int> CountImagesByItemAndRoleAsync(Guid returnExchangeItemId, string role);
    }
}
