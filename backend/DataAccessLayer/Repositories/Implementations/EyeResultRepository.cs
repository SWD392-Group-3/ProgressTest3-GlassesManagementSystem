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
    public class EyeResultRepository : GenericRepository<EyeResult>, IEyeResultRepository
    {
        public EyeResultRepository(IApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<EyeResult>> GetByOrderIdAsync(Guid orderId)
        {
            return await _context.EyeResult
                .Include(e => e.Staff)
                .Where(e => e.OrderId == orderId)
                .OrderByDescending(e => e.Id)
                .ToListAsync();
        }

        public async Task<EyeResult?> GetByIdWithStaffAsync(Guid id)
        {
            return await _context.EyeResult
                .Include(e => e.Staff)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
    }
}
