using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    /// <summary>
    /// Gửi thông báo real-time qua SignalR và lưu vào DB để xem lại.
    /// Abstraction nằm ở BLL để OrderService không phụ thuộc trực tiếp vào Hub.
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Gửi thông báo thay đổi trạng thái đơn hàng tới khách hàng cụ thể
        /// và lưu vào bảng Notifications.
        /// <para>customerId = Customer.Id; hệ thống tự lookup UserId tương ứng.</para>
        /// </summary>
        Task SendOrderStatusChangedAsync(Guid customerId, Guid orderId, string newStatus);

        /// <summary>
        /// Gửi thông báo đơn hàng mới đã thanh toán tới toàn bộ nhân viên Sale.
        /// </summary>
        Task SendNewOrderPaidToSalesAsync(Guid orderId, string customerName, decimal totalAmount);

        /// <summary>
        /// Gửi thông báo yêu cầu kính đơn (prescription) bị từ chối tới khách hàng
        /// và lưu vào bảng Notifications.
        /// </summary>
        Task SendPrescriptionRejectedAsync(Guid customerId, Guid prescriptionId, string? reason);

        /// <summary>
        /// Gửi thông báo tới toàn bộ nhân viên Operation khi khách hàng xác nhận đã nhận hàng.
        /// Đơn hàng chuyển sang Completed và sẵn sàng cho quy trình đổi/trả nếu cần.
        /// </summary>
        Task SendDeliveryConfirmedToOperationAsync(Guid orderId, string customerName);

        /// <summary>Lấy danh sách thông báo của user (mới nhất trước).</summary>
        Task<IReadOnlyList<NotificationDto>> GetByUserIdAsync(Guid userId, int limit = 50);

        /// <summary>Đánh dấu một thông báo đã đọc. Trả về false nếu không tìm thấy.</summary>
        Task<bool> MarkReadAsync(Guid notificationId, Guid userId);

        /// <summary>Đánh dấu toàn bộ thông báo của user là đã đọc.</summary>
        Task MarkAllReadAsync(Guid userId);
    }
}
