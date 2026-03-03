using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    /// <summary>
    /// Request từ client gửi lên để tạo link thanh toán Momo.
    /// </summary>
    public class MomoCreatePaymentRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        /// <summary>
        /// Số tiền thanh toán (VND, không có phần thập phân).
        /// </summary>
        [Required, Range(1000, double.MaxValue, ErrorMessage = "Số tiền tối thiểu là 1,000 VND.")]
        public long Amount { get; set; }

        public string? OrderInfo { get; set; }
    }
}
