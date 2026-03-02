using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementations
{
    public class ReturnExchangeHistoryRepository
        : GenericRepository<ReturnExchangeHistory>,
            IReturnExchangeHistoryRepository
    {
        public ReturnExchangeHistoryRepository(IApplicationDbContext context)
            : base(context) { }

        public async Task<IEnumerable<ReturnExchangeHistory>> GetByReturnExchangeIdAsync(
            Guid returnExchangeId
        )
        {
            return await _context
                .Set<ReturnExchangeHistory>()
                .Where(x => x.ReturnExchangeId == returnExchangeId)
                .OrderBy(x => x.PerformedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReturnExchangeHistory>> GetByUserIdAsync(Guid userId)
        {
            return await _context
                .Set<ReturnExchangeHistory>()
                .Where(x => x.PerformedByUserId == userId)
                .OrderByDescending(x => x.PerformedAt)
                .ToListAsync();
        }
    }
}
