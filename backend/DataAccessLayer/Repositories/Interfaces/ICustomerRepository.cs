using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface ICustomerRepository : IGenericRepository<Customer>
    {
        public Task<Customer?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
