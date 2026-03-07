namespace BusinessLogicLayer.DTOs.Response
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = null!;
        public string? Content { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }   // "unread" | "read"
        public string? LinkTo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public bool IsRead => ReadAt.HasValue;
    }
}
