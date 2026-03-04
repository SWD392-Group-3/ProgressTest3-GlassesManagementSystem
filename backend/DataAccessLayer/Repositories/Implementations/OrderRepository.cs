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
    public class OrderRepository : GenericRepository<Order>, IOrderRepository
    {
        public OrderRepository(IApplicationDbContext context)
            : base(context) { }

        public async Task<Order?> GetByIdAndUserIdAsync(Guid orderId, Guid customerId)
        {
            return await _context
                .Order.Where(o => o.Id == orderId && o.CustomerId == customerId)
                .FirstOrDefaultAsync();
        }

        public async Task<Order?> GetByIdWithItemsAsync(Guid orderId)
        {
            return await _context
                .Order.Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId)
        {
            return await _context
                .Order.Include(o => o.OrderItems)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetAll()
        {
            return await _context
                .Order.Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }
    }
}
