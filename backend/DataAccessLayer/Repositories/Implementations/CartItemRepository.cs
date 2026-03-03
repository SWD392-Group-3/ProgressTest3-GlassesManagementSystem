using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace DataAccessLayer.Repositories.Implementations
{
    public class CartItemRepository : GenericRepository<CartItem>, ICartItemRepository
    {
        public CartItemRepository(IApplicationDbContext context) : base(context)
        {
        }

        public void RemoveRange(IEnumerable<CartItem> items)
        {
            _context.CartItem.RemoveRange(items);
        }
    }
}
