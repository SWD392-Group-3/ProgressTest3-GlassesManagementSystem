using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class ProductManagerService : IProductManagerService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductManagerService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _unitOfWork.GetRepository<Product>().GetAllAsync();
            return products.Select(MapToProductDto);
        }

        public async Task<ProductDto?> GetProductByIdAsync(Guid id)
        {
            var products = await _unitOfWork.GetRepository<Product>().FindAsync(p => p.Id == id);
            var product = products.FirstOrDefault();
            if (product == null) return null;

            return MapToProductDto(product);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductRequest request)
        {
            var product = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = request.CategoryId ?? Guid.Empty,
                BrandId = request.BrandId ?? Guid.Empty,
                WarrantyPolicyId = request.WarrantyPolicyId ?? Guid.Empty,
                Name = request.Name,
                Description = request.Description,
                Status = request.Status ?? "Active",
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.GetRepository<Product>().AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id) ?? MapToProductDto(product);
        }

        public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request)
        {
            var product = await _unitOfWork.GetRepository<Product>().GetByIdAsync(id);
            if (product == null) throw new Exception("Product not found");

            product.CategoryId = request.CategoryId ?? Guid.Empty;
            product.BrandId = request.BrandId ?? Guid.Empty;
            product.WarrantyPolicyId = request.WarrantyPolicyId ?? Guid.Empty;
            product.Name = request.Name;
            product.Description = request.Description;
            product.ImageUrl = request.ImageUrl;
            if (request.Status != null)
                product.Status = request.Status;
            
            product.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.GetRepository<Product>().Update(product);
            await _unitOfWork.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id) ?? MapToProductDto(product);
        }

        public async Task<bool> DeleteProductAsync(Guid id)
        {
            var product = await _unitOfWork.GetRepository<Product>().GetByIdAsync(id);
            if (product == null) return false;

            _unitOfWork.GetRepository<Product>().Delete(product);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _unitOfWork.GetRepository<Category>().GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Status = c.Status
            });
        }

        public async Task<IEnumerable<BrandDto>> GetAllBrandsAsync()
        {
            var brands = await _unitOfWork.GetRepository<Brand>().GetAllAsync();
            return brands.Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                Country = b.Country,
                Status = b.Status
            });
        }

        private ProductDto MapToProductDto(Product p)
        {
            return new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                BrandId = p.BrandId,
                WarrantyPolicyId = p.WarrantyPolicyId,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Category = p.Category != null ? new CategoryDto { Id = p.Category.Id, Name = p.Category.Name } : null,
                Brand = p.Brand != null ? new BrandDto { Id = p.Brand.Id, Name = p.Brand.Name } : null,
                ProductVariants = p.ProductVariants?.Select(pv => new ProductVariantDto
                {
                    Id = pv.Id,
                    ProductId = pv.ProductId,
                    Color = pv.Color,
                    Size = pv.Size,
                    Material = pv.Material,
                    Price = pv.Price,
                    Status = pv.Status,
                    ImageUrl = pv.ImageUrl
                }).ToList() ?? new List<ProductVariantDto>(),
                LensesVariants = p.LensVariants?.Select(lv => new LensesVariantDto
                {
                    Id = lv.Id,
                    ProductId = lv.ProductId,
                    DoCau = lv.DoCau,
                    DoTru = lv.DoTru,
                    ChiSoKhucXa = lv.ChiSoKhucXa,
                    Price = lv.Price,
                    Status = lv.Status,
                    ImageUrl = lv.ImageUrl
                }).ToList() ?? new List<LensesVariantDto>()
            };
        }
    }
}
