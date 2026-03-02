using System;

namespace DataAccessLayer.Database.Entities
{
    public class ReturnExchangeHistory
    {
        public Guid Id { get; set; }
        public Guid ReturnExchangeId { get; set; }

        public string Action { get; set; } = string.Empty; // Created, ReviewedBySales, ApprovedBySales, RejectedBySales, ReceivedByOperation, Completed, etc.
        public string? OldStatus { get; set; }
        public string? NewStatus { get; set; }
        public string? Comment { get; set; }

        public Guid PerformedByUserId { get; set; }
        public string PerformedByRole { get; set; } = string.Empty; // Customer, Sales, Operation, Admin
        public DateTime PerformedAt { get; set; }

        // Navigation
        public virtual ReturnExchange ReturnExchange { get; set; } = null!;
    }
}
