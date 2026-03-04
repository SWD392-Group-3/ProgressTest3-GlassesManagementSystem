namespace BusinessLogicLayer.DTOs.Response
{
    public class PrescriptionDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }

        public string? CangKinh { get; set; }
        public string? BanLe { get; set; }
        public string? VienGong { get; set; }
        public string? ChanVeMui { get; set; }
        public string? CauGong { get; set; }
        public string? DuoiGong { get; set; }

        public string? Note { get; set; }
        public string? Status { get; set; }
        public Guid? OrderId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
