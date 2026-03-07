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
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.LensesVariant)
                        .ThenInclude(lv => lv!.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Service)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Slot)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ComboItem)
                        .ThenInclude(ci => ci!.Combo)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId)
        {
            return await _context
                .Order.Include(o => o.OrderItems)
                .Include(o => o.Payments)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetAll()
        {
            return await _context
                .Order.Include(o => o.OrderItems)
                .Include(o => o.Payments)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }
    }
}
