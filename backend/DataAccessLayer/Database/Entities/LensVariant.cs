using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class LensVariant
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }

        public decimal? DoCau { get; set; }
        public decimal? DoTru { get; set; }
        public decimal? ChiSoKhucXa { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }

        public virtual Product Product { get; set; } = null!;
    }
}
