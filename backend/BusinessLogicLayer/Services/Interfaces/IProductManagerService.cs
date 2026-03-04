using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IProductManagerService
    {
        // Product
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(Guid id);
        Task<ProductDto> CreateProductAsync(CreateProductRequest request);
        Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request);
        Task<bool> DeleteProductAsync(Guid id);

        // Category & Brand Management
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request);
        Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request);
        Task<bool> DeleteCategoryAsync(Guid id);

        Task<IEnumerable<BrandDto>> GetAllBrandsAsync();
        Task<BrandDto> CreateBrandAsync(CreateBrandRequest request);
        Task<BrandDto> UpdateBrandAsync(Guid id, UpdateBrandRequest request);
        Task<bool> DeleteBrandAsync(Guid id);

        // Frame Variant Management (ProductVariant)
        Task<IEnumerable<ProductVariantDto>> GetFrameVariantsByProductAsync(Guid productId);
        Task<ProductVariantDto?> GetFrameVariantByIdAsync(Guid id);
        Task<ProductVariantDto> CreateFrameVariantAsync(CreateFrameVariantRequest request);
        Task<ProductVariantDto> UpdateFrameVariantAsync(Guid id, UpdateFrameVariantRequest request);
        Task<bool> DeleteFrameVariantAsync(Guid id);

        // Lens Variant Management
        Task<IEnumerable<LensesVariantDto>> GetLensVariantsByProductAsync(Guid productId);
        Task<LensesVariantDto?> GetLensVariantByIdAsync(Guid id);
        Task<LensesVariantDto> CreateLensVariantAsync(CreateLensVariantRequest request);
        Task<LensesVariantDto> UpdateLensVariantAsync(Guid id, UpdateLensVariantRequest request);
        Task<bool> DeleteLensVariantAsync(Guid id);
    }
}
