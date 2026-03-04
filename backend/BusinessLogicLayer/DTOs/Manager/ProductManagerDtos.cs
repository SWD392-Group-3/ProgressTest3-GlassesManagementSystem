using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Manager
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateCategoryRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    public class BrandDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Country { get; set; }
        public string? Status { get; set; }
    }

    public class CreateBrandRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Country { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateBrandRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Country { get; set; }
        public string? Status { get; set; }
    }

    // Frame Variant (ProductVariant)
    public class ProductVariantDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class CreateFrameVariantRequest
    {
        public Guid ProductId { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateFrameVariantRequest
    {
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    // Lens Variant
    public class LensesVariantDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public decimal? DoCau { get; set; }
        public decimal? DoTru { get; set; }
        public decimal? ChiSoKhucXa { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class CreateLensVariantRequest
    {
        public Guid ProductId { get; set; }
        public decimal? DoCau { get; set; }
        public decimal? DoTru { get; set; }
        public decimal? ChiSoKhucXa { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateLensVariantRequest
    {
        public decimal? DoCau { get; set; }
        public decimal? DoTru { get; set; }
        public decimal? ChiSoKhucXa { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class ProductDto
    {
        public Guid Id { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public Guid? WarrantyPolicyId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public CategoryDto? Category { get; set; }
        public BrandDto? Brand { get; set; }
        public List<ProductVariantDto> ProductVariants { get; set; } = new();
        public List<LensesVariantDto> LensesVariants { get; set; } = new();
    }
}

