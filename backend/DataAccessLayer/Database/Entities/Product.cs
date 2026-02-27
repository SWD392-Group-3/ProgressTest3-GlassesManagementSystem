using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Product
    {
        public Guid Id { get; set; }

        public Guid CategoryId { get; set; }
        public Guid BrandId { get; set; }
        public Guid WarrantyPolicyId { get; set; }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation
        public virtual Category Category { get; set; } = null!;
        public virtual Brand Brand { get; set; } = null!;
        public virtual WarrantyPolicy WarrantyPolicy { get; set; } = null!;

        public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<LensVariant> LensVariants { get; set; } = new List<LensVariant>();
    }
}
