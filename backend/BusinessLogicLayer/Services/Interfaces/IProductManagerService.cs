using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IProductManagerService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(Guid id);
        Task<ProductDto> CreateProductAsync(CreateProductRequest request);
        Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request);
        Task<bool> DeleteProductAsync(Guid id);
        
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<IEnumerable<BrandDto>> GetAllBrandsAsync();
    }
}
