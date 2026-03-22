namespace BusinessLogicLayer.DTOs.Response
{
    public class EyeResultDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid StaffId { get; set; }
        public string? StaffName { get; set; }

        public string? EyeLeft { get; set; }
        public string? EyeRight { get; set; }

        public bool Vien { get; set; }
        public bool Loan { get; set; }
        public int? Can { get; set; }

        public string? Note { get; set; }
    }
}
