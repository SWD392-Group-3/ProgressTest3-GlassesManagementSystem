using System;
using System.Collections.Generic;

namespace DataAccessLayer.Database.Entities
{
    public class Feedback
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProductId { get; set; }
        public Guid OrderItemId { get; set; }

        public int Rating { get; set; } // 1 to 5 stars
        public string? Comment { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Customer Customer { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual OrderItem OrderItem { get; set; } = null!;
    }
}
