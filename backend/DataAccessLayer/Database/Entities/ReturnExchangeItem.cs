using System;
using System.Collections.Generic;

namespace DataAccessLayer.Database.Entities
{
    public class ReturnExchangeItem
    {
        public Guid Id { get; set; }
        public Guid ReturnExchangeId { get; set; }
        public Guid OrderItemId { get; set; }

        public int Quantity { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Received
        public string? Note { get; set; }
        /// <summary>Kết quả kiểm tra khi Operations nhận hàng: Available, Defective, Damaged, NeedRepair.</summary>
        public string? InspectionResult { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation
        public virtual ReturnExchange ReturnExchange { get; set; } = null!;
        public virtual OrderItem OrderItem { get; set; } = null!;
        public virtual ICollection<ReturnExchangeImage> Images { get; set; } =
            new List<ReturnExchangeImage>();
    }
}
