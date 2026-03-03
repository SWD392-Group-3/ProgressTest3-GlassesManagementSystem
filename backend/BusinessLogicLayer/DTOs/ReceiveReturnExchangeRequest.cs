namespace BusinessLogicLayer.DTOs
{
    public class ReceiveReturnExchangeRequest
    {
        public Guid ReturnExchangeId { get; set; }
        public string? Comment { get; set; }
        public List<ReceiveItemRequest> Items { get; set; } = new();
    }

    public class ReceiveItemRequest
    {
        public Guid ReturnExchangeItemId { get; set; }
        public string Status { get; set; } = string.Empty; // Received, Rejected
        public string? Note { get; set; }
        /// <summary>Kết quả kiểm tra: Available, Defective, Damaged, NeedRepair.</summary>
        public string? InspectionResult { get; set; }
        public List<string>? ImageUrls { get; set; }
    }
}
