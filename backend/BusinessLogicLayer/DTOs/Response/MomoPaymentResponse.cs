namespace BusinessLogicLayer.DTOs.Response
{
    /// <summary>
    /// Response trả về client sau khi tạo yêu cầu thanh toán Momo thành công.
    /// </summary>
    public class MomoCreatePaymentResponse
    {
        /// <summary>URL để redirect khách hàng vào ví Momo thanh toán.</summary>
        public string PayUrl { get; set; } = null!;

        public string OrderId { get; set; } = null!;
        public string RequestId { get; set; } = null!;
        public long Amount { get; set; }
        public string Message { get; set; } = null!;
        public int ResultCode { get; set; }
    }

    /// <summary>
    /// Callback Momo gửi về sau khi user thanh toán xong (returnUrl).
    /// </summary>
    public class MomoCallbackResponse
    {
        public string PartnerCode { get; set; } = null!;
        public string OrderId { get; set; } = null!;
        public string RequestId { get; set; } = null!;
        public long Amount { get; set; }
        public string OrderInfo { get; set; } = null!;
        public string OrderType { get; set; } = null!;
        public long TransId { get; set; }
        public int ResultCode { get; set; }
        public string Message { get; set; } = null!;
        public string PayType { get; set; } = null!;
        public long ResponseTime { get; set; }
        public string? ExtraData { get; set; }
        public string Signature { get; set; } = null!;
    }
}
