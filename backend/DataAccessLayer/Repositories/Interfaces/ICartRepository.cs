using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface ICartRepository : IGenericRepository<Cart>
    {
        Task<Cart?> GetCartByCustomerIdAsync(Guid customerId);
        Task<Cart?> GetCartByCartItemIdAsync(Guid cartItemId);
    }
}
