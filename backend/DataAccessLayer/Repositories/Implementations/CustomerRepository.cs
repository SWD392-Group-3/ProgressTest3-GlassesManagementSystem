using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

        public async Task<Customer?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Customer
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }
    }
}
