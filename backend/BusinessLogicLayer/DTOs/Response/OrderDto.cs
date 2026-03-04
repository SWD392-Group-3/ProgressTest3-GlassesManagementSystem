using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Response
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid? PromotionId { get; set; }
        public string? Status { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public string? PaymentStatus { get; set; }   // null | "Paid" | "Failed"
        public DateTime OrderDate { get; set; }
        public string? ShippingAddress { get; set; }
        public string? ShippingPhone { get; set; }
        public string? Note { get; set; }
        public IEnumerable<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
    }
}
