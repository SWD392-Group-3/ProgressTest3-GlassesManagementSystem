using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }

        public Guid? ProductId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public Guid? ComboItemId { get; set; }
        public Guid? ServiceId { get; set; }
        public Guid? SlotId { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        public string? Note { get; set; }

        // Navigation
        public virtual Order Order { get; set; } = null!;

        public virtual ICollection<ReturnExchangeItem> ReturnExchangeItems { get; set; } =
            new List<ReturnExchangeItem>();

        public virtual Product? Product { get; set; }
        public virtual ProductVariant? ProductVariant { get; set; }
        public virtual LensVariant? LensesVariant { get; set; }
        public virtual ComboItem? ComboItem { get; set; }
        public virtual Service? Service { get; set; }
        public virtual Slot? Slot { get; set; }
    }
}
