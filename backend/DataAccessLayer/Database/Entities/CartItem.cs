using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class CartItem
    {
        public Guid Id { get; set; }
        public Guid CartId { get; set; }

        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public Guid? ComboItemId { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }

        public string? Note { get; set; }

        public virtual Cart Cart { get; set; } = null!;
    }
}
