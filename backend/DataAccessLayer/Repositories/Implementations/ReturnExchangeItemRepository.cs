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
    }
}
