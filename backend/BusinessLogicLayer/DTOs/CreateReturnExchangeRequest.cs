namespace BusinessLogicLayer.DTOs
{
    public class CreateReturnExchangeRequest
    {
        public Guid OrderId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public List<ReturnItemRequest> Items { get; set; } = new();
    }

    public class ReturnItemRequest
    {
        public Guid OrderItemId { get; set; }
        public int Quantity { get; set; }
        public string? Reason { get; set; }
        public List<string>? ImageUrls { get; set; }
    }
}
