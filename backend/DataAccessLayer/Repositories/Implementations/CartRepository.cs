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
    public class CartRepository : GenericRepository<Cart>, ICartRepository
    {
        public CartRepository(IApplicationDbContext context) : base(context)
        {
        }

        public async Task<Cart?> GetCartByCartItemIdAsync(Guid cartItemId)
        {
            return await _context.Cart
                .Where(c => c.CartItems.Any(ci => ci.Id == cartItemId))
                .FirstOrDefaultAsync();
        }

        public async Task<Cart?> GetCartByCustomerIdAsync(Guid customerId)
        {
            return await _context.Cart
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.ProductVariant)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.LensesVariant)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.ComboItem)
                        .ThenInclude(co => co!.Combo)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Service)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);
        }
    }
}
