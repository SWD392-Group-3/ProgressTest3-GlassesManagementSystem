using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class CreatePrescriptionRequest
    {
        [Required]
        public Guid ServiceId { get; set; }

        public string? CangKinh { get; set; }
        public string? BanLe { get; set; }
        public string? VienGong { get; set; }
        public string? ChanVeMui { get; set; }
        public string? CauGong { get; set; }
        public string? DuoiGong { get; set; }
        public string? Note { get; set; }
    }

    public class UpdatePrescriptionRequest
    {
        public string? CangKinh { get; set; }
        public string? BanLe { get; set; }
        public string? VienGong { get; set; }
        public string? ChanVeMui { get; set; }
        public string? CauGong { get; set; }
        public string? DuoiGong { get; set; }
        public string? Note { get; set; }
    }

    public class ConfirmPrescriptionRequest
    {
        [Required]
        public Guid ProductVariantId { get; set; }

        [Required]
        public Guid LensesVariantId { get; set; }

        [Required]
        public string ShippingAddress { get; set; } = null!;

        [Required]
        public string ShippingPhone { get; set; } = null!;

        public string? Note { get; set; }
    }

    public class RejectPrescriptionRequest
    {
        public string? Reason { get; set; }
    }
}
