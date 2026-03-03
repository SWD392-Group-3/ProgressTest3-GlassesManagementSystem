using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementations
{
    public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
    {
        public CustomerRepository(IApplicationDbContext context) : base(context)
        {
        }

        public async Task<Customer?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        }
    }
}
