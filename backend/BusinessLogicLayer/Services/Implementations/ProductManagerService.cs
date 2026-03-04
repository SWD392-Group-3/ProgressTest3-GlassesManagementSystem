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
        private readonly IProductRepository _productRepository;

        public ProductManagerService(IUnitOfWork unitOfWork, IProductRepository productRepository)
        {
            _unitOfWork = unitOfWork;
            _productRepository = productRepository;
        }

        // ─── PRODUCT ──────────────────────────────────────────────────────────

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllWithDetailsAsync();
            return products.Select(MapToProductDto);
        }

        public async Task<ProductDto?> GetProductByIdAsync(Guid id)
        {
            var product = await _productRepository.GetByIdWithDetailsAsync(id);
            return product == null ? null : MapToProductDto(product);
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
                UnitPrice = request.UnitPrice,
                Status = request.Status ?? "Active",
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.GetRepository<Product>().AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id) ?? MapToProductDto(product);
        }

        public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request)
        {
            var product = await _unitOfWork.GetRepository<Product>().GetByIdAsync(id);
            if (product == null)
                throw new Exception("Product not found");

            product.CategoryId = request.CategoryId ?? Guid.Empty;
            product.BrandId = request.BrandId ?? Guid.Empty;
            product.WarrantyPolicyId = request.WarrantyPolicyId ?? Guid.Empty;
            product.Name = request.Name;
            product.Description = request.Description;
            product.UnitPrice = request.UnitPrice;
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
            if (product == null)
                return false;

            _unitOfWork.GetRepository<Product>().Delete(product);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── CATEGORY MANAGEMENT ──────────────────────────────────────────────

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _unitOfWork.GetRepository<Category>().GetAllAsync();
            return categories.Select(MapToCategoryDto);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Status = request.Status ?? "Active",
            };

            await _unitOfWork.GetRepository<Category>().AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return MapToCategoryDto(category);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request)
        {
            var category = await _unitOfWork.GetRepository<Category>().GetByIdAsync(id);
            if (category == null)
                throw new Exception("Category not found");

            category.Name = request.Name;
            category.Description = request.Description;
            if (request.Status != null)
                category.Status = request.Status;

            _unitOfWork.GetRepository<Category>().Update(category);
            await _unitOfWork.SaveChangesAsync();
            return MapToCategoryDto(category);
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var category = await _unitOfWork.GetRepository<Category>().GetByIdAsync(id);
            if (category == null)
                return false;

            _unitOfWork.GetRepository<Category>().Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── BRAND MANAGEMENT ─────────────────────────────────────────────────

        public async Task<IEnumerable<BrandDto>> GetAllBrandsAsync()
        {
            var brands = await _unitOfWork.GetRepository<Brand>().GetAllAsync();
            return brands.Select(MapToBrandDto);
        }

        public async Task<BrandDto> CreateBrandAsync(CreateBrandRequest request)
        {
            var brand = new Brand
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Country = request.Country,
                Status = request.Status ?? "Active",
            };

            await _unitOfWork.GetRepository<Brand>().AddAsync(brand);
            await _unitOfWork.SaveChangesAsync();
            return MapToBrandDto(brand);
        }

        public async Task<BrandDto> UpdateBrandAsync(Guid id, UpdateBrandRequest request)
        {
            var brand = await _unitOfWork.GetRepository<Brand>().GetByIdAsync(id);
            if (brand == null)
                throw new Exception("Brand not found");

            brand.Name = request.Name;
            brand.Description = request.Description;
            brand.Country = request.Country;
            if (request.Status != null)
                brand.Status = request.Status;

            _unitOfWork.GetRepository<Brand>().Update(brand);
            await _unitOfWork.SaveChangesAsync();
            return MapToBrandDto(brand);
        }

        public async Task<bool> DeleteBrandAsync(Guid id)
        {
            var brand = await _unitOfWork.GetRepository<Brand>().GetByIdAsync(id);
            if (brand == null)
                return false;

            _unitOfWork.GetRepository<Brand>().Delete(brand);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── FRAME VARIANT MANAGEMENT (Product Pricing Setup - Frames) ────────

        public async Task<IEnumerable<ProductVariantDto>> GetFrameVariantsByProductAsync(
            Guid productId
        )
        {
            var variants = await _unitOfWork
                .GetRepository<ProductVariant>()
                .FindAsync(v => v.ProductId == productId);
            return variants.Select(MapToProductVariantDto);
        }

        public async Task<ProductVariantDto?> GetFrameVariantByIdAsync(Guid id)
        {
            var variant = await _unitOfWork.GetRepository<ProductVariant>().GetByIdAsync(id);
            return variant == null ? null : MapToProductVariantDto(variant);
        }

        public async Task<ProductVariantDto> CreateFrameVariantAsync(
            CreateFrameVariantRequest request
        )
        {
            var variant = new ProductVariant
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                Color = request.Color,
                Size = request.Size,
                Material = request.Material,
                Price = request.Price,
                Status = request.Status ?? "Active",
                ImageUrl = request.ImageUrl,
            };

            await _unitOfWork.GetRepository<ProductVariant>().AddAsync(variant);
            await _unitOfWork.SaveChangesAsync();
            return MapToProductVariantDto(variant);
        }

        public async Task<ProductVariantDto> UpdateFrameVariantAsync(
            Guid id,
            UpdateFrameVariantRequest request
        )
        {
            var variant = await _unitOfWork.GetRepository<ProductVariant>().GetByIdAsync(id);
            if (variant == null)
                throw new Exception("Frame variant not found");

            variant.Color = request.Color;
            variant.Size = request.Size;
            variant.Material = request.Material;
            variant.Price = request.Price;
            if (request.Status != null)
                variant.Status = request.Status;
            variant.ImageUrl = request.ImageUrl;

            _unitOfWork.GetRepository<ProductVariant>().Update(variant);
            await _unitOfWork.SaveChangesAsync();
            return MapToProductVariantDto(variant);
        }

        public async Task<bool> DeleteFrameVariantAsync(Guid id)
        {
            var variant = await _unitOfWork.GetRepository<ProductVariant>().GetByIdAsync(id);
            if (variant == null)
                return false;

            _unitOfWork.GetRepository<ProductVariant>().Delete(variant);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── LENS VARIANT MANAGEMENT (Product Pricing Setup - Lenses) ─────────

        public async Task<IEnumerable<LensesVariantDto>> GetLensVariantsByProductAsync(
            Guid productId
        )
        {
            var variants = await _unitOfWork
                .GetRepository<LensVariant>()
                .FindAsync(v => v.ProductId == productId);
            return variants.Select(MapToLensVariantDto);
        }

        public async Task<LensesVariantDto?> GetLensVariantByIdAsync(Guid id)
        {
            var variant = await _unitOfWork.GetRepository<LensVariant>().GetByIdAsync(id);
            return variant == null ? null : MapToLensVariantDto(variant);
        }

        public async Task<LensesVariantDto> CreateLensVariantAsync(CreateLensVariantRequest request)
        {
            var variant = new LensVariant
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                DoCau = request.DoCau,
                DoTru = request.DoTru,
                ChiSoKhucXa = request.ChiSoKhucXa,
                Price = request.Price,
                Status = request.Status ?? "Active",
                ImageUrl = request.ImageUrl,
            };

            await _unitOfWork.GetRepository<LensVariant>().AddAsync(variant);
            await _unitOfWork.SaveChangesAsync();
            return MapToLensVariantDto(variant);
        }

        public async Task<LensesVariantDto> UpdateLensVariantAsync(
            Guid id,
            UpdateLensVariantRequest request
        )
        {
            var variant = await _unitOfWork.GetRepository<LensVariant>().GetByIdAsync(id);
            if (variant == null)
                throw new Exception("Lens variant not found");

            variant.DoCau = request.DoCau;
            variant.DoTru = request.DoTru;
            variant.ChiSoKhucXa = request.ChiSoKhucXa;
            variant.Price = request.Price;
            if (request.Status != null)
                variant.Status = request.Status;
            variant.ImageUrl = request.ImageUrl;

            _unitOfWork.GetRepository<LensVariant>().Update(variant);
            await _unitOfWork.SaveChangesAsync();
            return MapToLensVariantDto(variant);
        }

        public async Task<bool> DeleteLensVariantAsync(Guid id)
        {
            var variant = await _unitOfWork.GetRepository<LensVariant>().GetByIdAsync(id);
            if (variant == null)
                return false;

            _unitOfWork.GetRepository<LensVariant>().Delete(variant);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── MAPPERS ──────────────────────────────────────────────────────────

        private static CategoryDto MapToCategoryDto(Category c) =>
            new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Status = c.Status,
            };

        private static BrandDto MapToBrandDto(Brand b) =>
            new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                Country = b.Country,
                Status = b.Status,
            };

        private static ProductVariantDto MapToProductVariantDto(ProductVariant pv) =>
            new ProductVariantDto
            {
                Id = pv.Id,
                ProductId = pv.ProductId,
                Color = pv.Color,
                Size = pv.Size,
                Material = pv.Material,
                Price = pv.Price,
                Status = pv.Status,
                ImageUrl = pv.ImageUrl,
            };

        private static LensesVariantDto MapToLensVariantDto(LensVariant lv) =>
            new LensesVariantDto
            {
                Id = lv.Id,
                ProductId = lv.ProductId,
                DoCau = lv.DoCau,
                DoTru = lv.DoTru,
                ChiSoKhucXa = lv.ChiSoKhucXa,
                Price = lv.Price,
                Status = lv.Status,
                ImageUrl = lv.ImageUrl,
            };

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
                UnitPrice = p.UnitPrice,
                Status = p.Status,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Category = p.Category != null ? MapToCategoryDto(p.Category) : null,
                Brand = p.Brand != null ? MapToBrandDto(p.Brand) : null,
                ProductVariants =
                    p.ProductVariants?.Select(MapToProductVariantDto).ToList()
                    ?? new List<ProductVariantDto>(),
                LensesVariants =
                    p.LensVariants?.Select(MapToLensVariantDto).ToList()
                    ?? new List<LensesVariantDto>(),
            };
        }
    }
}
