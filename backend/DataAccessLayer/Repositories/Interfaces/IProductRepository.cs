using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DataAccessLayer.Database.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<IReadOnlyList<Product>> GetAllWithDetailsAsync();
        Task<Product?> GetByIdWithDetailsAsync(Guid id);
    }
}
