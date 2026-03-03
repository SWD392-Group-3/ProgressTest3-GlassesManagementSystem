using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IMomoService
    {
        /// <summary>
        /// Gửi yêu cầu tạo link thanh toán đến Momo, trả về PayUrl để redirect.
        /// </summary>
        Task<MomoCreatePaymentResponse> CreatePaymentAsync(MomoCreatePaymentRequest request);

        /// <summary>
        /// Xác thực chữ ký callback từ Momo (tránh giả mạo).
        /// </summary>
        bool ValidateCallback(MomoCallbackResponse callback);
    }
}
