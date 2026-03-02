using System;

namespace DataAccessLayer.Database.Entities
{
    public class ReturnExchangeImage
    {
        public Guid Id { get; set; }
        public Guid ReturnExchangeItemId { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        public string UploadedByRole { get; set; } = string.Empty; // Customer, Sales, Operation
        public Guid UploadedByUserId { get; set; }
        public DateTime UploadedAt { get; set; }

        public string? Description { get; set; }

        // Navigation
        public virtual ReturnExchangeItem ReturnExchangeItem { get; set; } = null!;
    }
}
