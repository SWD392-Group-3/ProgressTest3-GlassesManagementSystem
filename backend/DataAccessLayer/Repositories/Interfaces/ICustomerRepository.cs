using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface ICustomerRepository : IGenericRepository<Customer>
    {
        Task<Customer?> GetByUserIdAsync(Guid userId);
    }
}
