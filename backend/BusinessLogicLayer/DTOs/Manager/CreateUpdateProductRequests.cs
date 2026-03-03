using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Manager
{
    public class CreateProductRequest
    {
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public Guid? WarrantyPolicyId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
        
        // Variants could be added here later if we want to create them all at once
    }

    public class UpdateProductRequest
    {
        public Guid Id { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public Guid? WarrantyPolicyId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
    }
}
