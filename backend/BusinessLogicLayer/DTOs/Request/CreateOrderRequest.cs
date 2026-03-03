using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Request
{
    public class CreateOrderRequest
    {
        public Guid CartId { get; set; }
        public Guid? PromotionId { get; set; }
        public string ShippingAddress { get; set; } = null!;
        public string ShippingPhone { get; set; } = null!;
        public string? Note { get; set; }
    }
}
