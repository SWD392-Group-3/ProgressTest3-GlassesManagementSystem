namespace BusinessLogicLayer.DTOs
{
    public class ReviewReturnExchangeRequest
    {
        public Guid ReturnExchangeId { get; set; }
        public bool IsApproved { get; set; }
        public string? Comment { get; set; }
        public string? RejectionReason { get; set; }
        public List<AddImageRequest>? Images { get; set; }
    }

    public class AddImageRequest
    {
        public Guid ReturnExchangeItemId { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public string? Description { get; set; }
    }
}
