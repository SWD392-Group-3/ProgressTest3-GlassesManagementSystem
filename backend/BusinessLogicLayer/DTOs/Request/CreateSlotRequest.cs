using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class CreateSlotRequest
    {
        [Required(ErrorMessage = "Ngày là bắt buộc.")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc.")]
        public TimeOnly StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc là bắt buộc.")]
        public TimeOnly EndTime { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; } = "Available";

        [MaxLength(500)]
        public string? Note { get; set; }
    }
}
