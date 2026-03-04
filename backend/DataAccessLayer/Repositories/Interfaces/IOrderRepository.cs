using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<Order?> GetByIdAndUserIdAsync(Guid orderId, Guid customerId);
        Task<Order?> GetByIdWithItemsAsync(Guid orderId);
        Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId);

        Task<IEnumerable<Order>> GetAll();
    }
}
