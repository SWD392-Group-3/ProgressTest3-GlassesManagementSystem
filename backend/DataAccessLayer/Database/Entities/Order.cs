using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Order
    {
        public Guid Id { get; set; }

        public Guid CustomerId { get; set; }
        public Guid? PromotionId { get; set; }
        public string? Status { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }

        public DateTime OrderDate { get; set; }

        public string? ShippingAddress { get; set; }
        public string? ShippingPhone { get; set; }
        public string? Note { get; set; }

        // Navigation
        public virtual Customer Customer { get; set; } = null!;
        public virtual Promotion? Promotion { get; set; }
        public virtual Service? Service { get; set; }

        public virtual Prescription? Prescription { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual ICollection<ReturnExchange> ReturnExchanges { get; set; } = new List<ReturnExchange>();
        public virtual ICollection<EyeResult> EyeResults { get; set; } = new List<EyeResult>();
    }
}
