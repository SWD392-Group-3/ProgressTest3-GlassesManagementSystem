using System.Collections.Generic;
using System.Linq;
using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementations
{
    public class ReturnExchangeItemRepository
        : GenericRepository<ReturnExchangeItem>,
            IReturnExchangeItemRepository
    {
        public ReturnExchangeItemRepository(IApplicationDbContext context)
            : base(context) { }

        public async Task<IEnumerable<ReturnExchangeItem>> GetByReturnExchangeIdAsync(
            Guid returnExchangeId
        )
        {
            return await _context
                .Set<ReturnExchangeItem>()
                .Where(x => x.ReturnExchangeId == returnExchangeId)
                .Include(x => x.OrderItem)
                .Include(x => x.Images)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReturnExchangeItem>> GetByOrderItemIdAsync(Guid orderItemId)
        {
            return await _context
                .Set<ReturnExchangeItem>()
                .Where(x => x.OrderItemId == orderItemId)
                .Include(x => x.ReturnExchange)
                .Include(x => x.Images)
                .ToListAsync();
        }

        public async Task<ReturnExchangeItem?> GetByIdWithOrderItemDetailsAsync(
            Guid id,
            CancellationToken cancellationToken = default
        )
        {
            return await _context
                .Set<ReturnExchangeItem>()
                .Include(x => x.OrderItem)
                .ThenInclude(o => o!.ProductVariant)
                .ThenInclude(pv => pv!.Product)
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IReadOnlyDictionary<Guid, int>> GetReceivedQuantityByOrderItemForCompletedReturnsAsync(
            Guid orderId,
            CancellationToken cancellationToken = default
        )
        {
            var rows = await (
                from rei in _context.Set<ReturnExchangeItem>()
                join re in _context.Set<ReturnExchange>() on rei.ReturnExchangeId equals re.Id
                where
                    re.OrderId == orderId
                    && re.Status == "Completed"
                    && rei.Status == "Received"
                group rei by rei.OrderItemId
                into g
                select new { OrderItemId = g.Key, Qty = g.Sum(x => x.Quantity) }
            ).ToListAsync(cancellationToken);

            return rows.ToDictionary(x => x.OrderItemId, x => x.Qty);
        }
    }
}
