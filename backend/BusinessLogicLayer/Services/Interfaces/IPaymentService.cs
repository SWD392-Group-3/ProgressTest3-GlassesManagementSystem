using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPaymentService
    {
        /// <summary>
        /// Xử lý IPN từ Momo: tạo Payment trong DB và cập nhật trạng thái Order.
        /// </summary>
        Task HandleMomoNotifyAsync(MomoCallbackResponse notify);
    }
}
