using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementations
{
    public class ReturnExchangeImageRepository
        : GenericRepository<ReturnExchangeImage>,
            IReturnExchangeImageRepository
    {
        public ReturnExchangeImageRepository(IApplicationDbContext context)
            : base(context) { }

        public async Task<IEnumerable<ReturnExchangeImage>> GetByReturnExchangeItemIdAsync(
            Guid returnExchangeItemId
        )
        {
            return await _context
                .Set<ReturnExchangeImage>()
                .Where(x => x.ReturnExchangeItemId == returnExchangeItemId)
                .OrderBy(x => x.UploadedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReturnExchangeImage>> GetByRoleAsync(string role)
        {
            return await _context
                .Set<ReturnExchangeImage>()
                .Where(x => x.UploadedByRole == role)
                .OrderByDescending(x => x.UploadedAt)
                .ToListAsync();
        }

        public async Task<int> CountImagesByItemAndRoleAsync(Guid returnExchangeItemId, string role)
        {
            return await _context
                .Set<ReturnExchangeImage>()
                .CountAsync(x =>
                    x.ReturnExchangeItemId == returnExchangeItemId && x.UploadedByRole == role
                );
        }
    }
}
