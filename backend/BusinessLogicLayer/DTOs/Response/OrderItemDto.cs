using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Response
{
    public class OrderItemDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }

        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public Guid? ComboItemId { get; set; }
        public Guid? ServiceId { get; set; }
        public Guid? SlotId { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        public string? Note { get; set; }
    }
}
