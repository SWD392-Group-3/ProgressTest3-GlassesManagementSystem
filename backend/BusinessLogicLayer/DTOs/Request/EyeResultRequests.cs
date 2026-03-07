namespace BusinessLogicLayer.DTOs.Request
{
    public class CreateEyeResultRequest
    {
        public Guid OrderId { get; set; }

        /// <summary>Kết quả mắt trái (VD: "S: -1.50, C: -0.50, A: 10")</summary>
        public string? EyeLeft { get; set; }

        /// <summary>Kết quả mắt phải</summary>
        public string? EyeRight { get; set; }

        /// <summary>Có viễn thị không</summary>
        public bool Vien { get; set; }

        /// <summary>Có loạn thị không</summary>
        public bool Loan { get; set; }

        /// <summary>Độ cận (nếu có)</summary>
        public int? Can { get; set; }

        public string? Note { get; set; }
    }

    public class UpdateEyeResultRequest
    {
        public string? EyeLeft { get; set; }
        public string? EyeRight { get; set; }
        public bool Vien { get; set; }
        public bool Loan { get; set; }
        public int? Can { get; set; }
        public string? Note { get; set; }
    }
}
