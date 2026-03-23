using System;

namespace BusinessLogicLayer.DTOs
{
    public class FeedbackResponse
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public Guid ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
    
    public class ProductFeedbackSummaryResponse 
    {
        public double AverageRating { get; set; }
        public int TotalFeedbacks { get; set; }
        public List<FeedbackResponse> Feedbacks { get; set; } = new();
    }
}
