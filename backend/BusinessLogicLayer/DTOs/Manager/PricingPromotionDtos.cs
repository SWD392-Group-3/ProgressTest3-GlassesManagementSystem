using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Manager
{
    public class PromotionDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
    }

    public class CreatePromotionRequest
    {
        public string Code { get; set; } = null!;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
    }

    public class UpdatePromotionRequest
    {
        public string Code { get; set; } = null!;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
    }

    public class ServiceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
    }

    public class CreateServiceRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateServiceRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
    }

    // ─── COMBO ────────────────────────────────────────────────────────────────

    public class ComboItemDto
    {
        public Guid Id { get; set; }
        public Guid ComboId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public int Quantity { get; set; }

        // Thông tin chi tiết gọng kính (nếu item là ProductVariant)
        public ComboFrameVariantDto? FrameVariant { get; set; }
        // Thông tin chi tiết tròng kính (nếu item là LensVariant)
        public ComboLensVariantDto? LensVariant { get; set; }
    }

    /// <summary>Gọng kính (ProductVariant) kèm tên sản phẩm</summary>
    public class ComboFrameVariantDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? ProductImageUrl { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    /// <summary>Tròng kính (LensVariant) kèm tên sản phẩm</summary>
    public class ComboLensVariantDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? ProductImageUrl { get; set; }
        public decimal? DoCau { get; set; }
        public decimal? DoTru { get; set; }
        public decimal? ChiSoKhucXa { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class ComboDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
        public List<ComboItemDto> ComboItems { get; set; } = new();
    }

    public class CreateComboRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateComboRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
    }

    public class AddComboItemRequest
    {
        /// <summary>Frame variant id (ProductVariant). Provide one of ProductVariantId or LensesVariantId.</summary>
        public Guid? ProductVariantId { get; set; }
        /// <summary>Lens variant id. Provide one of ProductVariantId or LensesVariantId.</summary>
        public Guid? LensesVariantId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    /// <summary>
    /// Service Pricing Setup UC: lightweight price-only update request.
    /// Used by PATCH /services/{id}/price.
    /// </summary>
    public class SetServicePriceRequest
    {
        public decimal Price { get; set; }
    }
}
