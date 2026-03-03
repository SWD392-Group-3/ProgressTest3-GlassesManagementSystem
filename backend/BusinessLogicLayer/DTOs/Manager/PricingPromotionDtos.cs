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

    // ─── COMBO ────────────────────────────────────────────────────────────────

    public class ComboItemDto
    {
        public Guid Id { get; set; }
        public Guid ComboId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public int Quantity { get; set; }
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
}
