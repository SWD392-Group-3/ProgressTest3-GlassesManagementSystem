using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class ComboItem
    {
        public Guid Id { get; set; }

        public Guid ComboId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }

        public int Quantity { get; set; }

        public virtual Combo Combo { get; set; } = null!;
        public virtual ProductVariant? ProductVariant { get; set; }
        public virtual LensVariant? LensesVariant { get; set; }
    }
}
