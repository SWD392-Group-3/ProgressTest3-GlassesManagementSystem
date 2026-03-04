namespace BusinessLogicLayer.DTOs
{
    public class ReturnExchangeResponse
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid CustomerId { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedBySalesAt { get; set; }
        public DateTime? ReceivedByOperationAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        public List<ReturnExchangeItemResponse> Items { get; set; } = new();
        public List<ReturnExchangeHistoryResponse> Histories { get; set; } = new();
    }

    public class ReturnExchangeItemResponse
    {
        public Guid Id { get; set; }
        public Guid OrderItemId { get; set; }
        public int Quantity { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string? InspectionResult { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<ReturnExchangeImageResponse> Images { get; set; } = new();
    }

    public class ReturnExchangeImageResponse
    {
        public Guid Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string UploadedByRole { get; set; } = string.Empty;
        public Guid UploadedByUserId { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? Description { get; set; }
    }

    public class ReturnExchangeHistoryResponse
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? OldStatus { get; set; }
        public string? NewStatus { get; set; }
        public string? Comment { get; set; }
        public Guid PerformedByUserId { get; set; }
        public string PerformedByRole { get; set; } = string.Empty;
        public DateTime PerformedAt { get; set; }
    }
}
