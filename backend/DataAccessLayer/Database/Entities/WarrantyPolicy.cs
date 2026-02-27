using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class WarrantyPolicy
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int WarrantyPeriodMonth { get; set; }
        public string? Conditions { get; set; }
        public string? Status { get; set; }

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
