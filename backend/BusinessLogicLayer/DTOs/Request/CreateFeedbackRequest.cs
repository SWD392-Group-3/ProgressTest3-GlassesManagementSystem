using System;

namespace BusinessLogicLayer.DTOs
{
    public class CreateFeedbackRequest
    {
        public Guid ProductId { get; set; }
        public Guid OrderItemId { get; set; }
        public int Rating { get; set; } // 1 to 5
        public string? Comment { get; set; }
    }
}
