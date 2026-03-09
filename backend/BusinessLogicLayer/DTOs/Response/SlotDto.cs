namespace BusinessLogicLayer.DTOs.Response
{
    public class SlotDto
    {
        public Guid Id { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
    }
}
