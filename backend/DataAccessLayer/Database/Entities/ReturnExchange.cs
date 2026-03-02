using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class ReturnExchange
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid CustomerId { get; set; }

        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, UnderReview, ApprovedBySales, ReceivedByOperation, Completed, Rejected
        public string? RejectionReason { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedBySalesAt { get; set; }
        public DateTime? ReceivedByOperationAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        // Navigation
        public virtual Order Order { get; set; } = null!;
        public virtual Customer Customer { get; set; } = null!;
        public virtual ICollection<ReturnExchangeItem> ReturnExchangeItems { get; set; } =
            new List<ReturnExchangeItem>();
        public virtual ICollection<ReturnExchangeHistory> Histories { get; set; } =
            new List<ReturnExchangeHistory>();
    }
}
