using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using GlassesManagementSystem.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace GlassesManagementSystem.Services;

/// <summary>
/// Gửi thông báo real-time qua SignalR VÀ lưu vào bảng Notifications trong DB.
/// Nằm ở API layer để tránh BLL → API circular dependency.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly INotificationRepository _notificationRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(
        IHubContext<NotificationHub> hubContext,
        INotificationRepository notificationRepo,
        ICustomerRepository customerRepo,
        IUserRepository userRepo,
        IUnitOfWork unitOfWork)
    {
        _hubContext      = hubContext;
        _notificationRepo = notificationRepo;
        _customerRepo    = customerRepo;
        _userRepo        = userRepo;
        _unitOfWork      = unitOfWork;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Public: Send & Save
    // ──────────────────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task SendOrderStatusChangedAsync(Guid customerId, Guid orderId, string newStatus)
    {
        var message = BuildOrderMessage(newStatus);
        var linkTo  = $"/orders/{orderId}";
        var now     = DateTime.UtcNow;

        // 1. Lưu vào DB (lookup UserId từ Customer)
        var userId = await GetUserIdByCustomerIdAsync(customerId);
        if (userId.HasValue)
        {
            await SaveNotificationAsync(
                userId.Value,
                title:   BuildOrderTitle(newStatus),
                content: message,
                type:    "order_status",
                linkTo:  linkTo,
                now:     now);
        }

        // 2. Gửi real-time qua SignalR
        await _hubContext.Clients
            .Group($"customer_{customerId}")
            .SendAsync("OrderStatusChanged", new
            {
                orderId   = orderId.ToString(),
                newStatus,
                message,
                timestamp = now
            });
    }

    /// <inheritdoc />
    public async Task SendNewOrderPaidToSalesAsync(Guid orderId, string customerName, decimal totalAmount)
    {
        var title   = "Đơn hàng mới cần phê duyệt";
        var message = $"Khách hàng {customerName} vừa đặt đơn hàng {totalAmount:N0}đ. Vui lòng xem xét và phê duyệt.";
        var linkTo  = $"/sales/orders/{orderId}";
        var now     = DateTime.UtcNow;

        // 1. Lưu DB cho tất cả nhân viên có role Sales
        var salesUsers = await _userRepo.FindAsync(u => u.Role == "Sales");
        foreach (var user in salesUsers)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                Id        = Guid.NewGuid(),
                UserId    = user.Id,
                Title     = title,
                Content   = message,
                Type      = "new_order",
                Status    = "unread",
                LinkTo    = linkTo,
                CreatedAt = now,
                ReadAt    = null
            });
        }
        if (salesUsers.Any())
            await _unitOfWork.SaveChangesAsync();

        // 2. Gửi real-time qua SignalR tới group "sales"
        await _hubContext.Clients.Group("sales").SendAsync("NewOrderPaid", new
        {
            orderId      = orderId.ToString(),
            customerName,
            totalAmount,
            message,
            timestamp    = now
        });
    }

    /// <inheritdoc />
    public async Task SendPrescriptionRejectedAsync(Guid customerId, Guid prescriptionId, string? reason)
    {
        var message = string.IsNullOrWhiteSpace(reason)
            ? "Yêu cầu kính đơn của bạn đã bị từ chối."
            : $"Yêu cầu kính đơn của bạn đã bị từ chối. Lý do: {reason}";
        var linkTo = "/prescriptions";
        var now    = DateTime.UtcNow;

        // 1. Lưu vào DB
        var userId = await GetUserIdByCustomerIdAsync(customerId);
        if (userId.HasValue)
        {
            await SaveNotificationAsync(
                userId.Value,
                title:   "Yêu cầu kính đơn bị từ chối",
                content: message,
                type:    "prescription_rejected",
                linkTo:  linkTo,
                now:     now);
        }

        // 2. Gửi real-time qua SignalR
        await _hubContext.Clients
            .Group($"customer_{customerId}")
            .SendAsync("PrescriptionRejected", new
            {
                prescriptionId = prescriptionId.ToString(),
                message,
                timestamp      = now
            });
    }

    /// <inheritdoc />
    public async Task SendDeliveryConfirmedToOperationAsync(Guid orderId, string customerName)
    {        var title   = "Khách hàng đã xác nhận nhận hàng";
        var message = $"Khách hàng {customerName} đã xác nhận nhận đơn hàng. Đơn hàng đã hoàn thành.";
        var linkTo  = $"/operation/orders/{orderId}";
        var now     = DateTime.UtcNow;

        // 1. Lưu DB cho tất cả nhân viên Operation
        var operationUsers = await _userRepo.FindAsync(u => u.Role == "Operation");
        foreach (var user in operationUsers)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                Id        = Guid.NewGuid(),
                UserId    = user.Id,
                Title     = title,
                Content   = message,
                Type      = "delivery_confirmed",
                Status    = "unread",
                LinkTo    = linkTo,
                CreatedAt = now,
                ReadAt    = null
            });
        }
        if (operationUsers.Any())
            await _unitOfWork.SaveChangesAsync();

        // 2. Gửi real-time qua SignalR tới group "operation"
        await _hubContext.Clients.Group("operation").SendAsync("DeliveryConfirmed", new
        {
            orderId      = orderId.ToString(),
            customerName,
            message,
            timestamp    = now
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Public: Query / Mark read
    // ──────────────────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task SendEyeResultReadyAsync(Guid customerId, Guid orderId)
    {
        const string title   = "Kết quả khám mắt đã sẵn sàng";
        var          message = "Nhân viên đã ghi nhận kết quả khám mắt cho đơn hàng của bạn. Nhấn để xem chi tiết.";
        var          linkTo  = $"/orders/{orderId}?tab=eye-result";
        var          now     = DateTime.UtcNow;

        // 1. Lưu vào DB (lookup UserId từ CustomerId)
        var userId = await GetUserIdByCustomerIdAsync(customerId);
        if (userId.HasValue)
        {
            await SaveNotificationAsync(
                userId.Value,
                title:   title,
                content: message,
                type:    "eye_result_ready",
                linkTo:  linkTo,
                now:     now);
        }

        // 2. Gửi real-time qua SignalR tới customer group
        await _hubContext.Clients
            .Group($"customer_{customerId}")
            .SendAsync("EyeResultReady", new
            {
                orderId   = orderId.ToString(),
                message,
                timestamp = now
            });
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<NotificationDto>> GetByUserIdAsync(Guid userId, int limit = 50)
    {
        var items = await _notificationRepo.GetByUserIdAsync(userId, limit);
        return items.Select(MapToDto).ToList().AsReadOnly();
    }

    /// <inheritdoc />
    public async Task<bool> MarkReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(notificationId);
        if (notification == null || notification.UserId != userId)
            return false;

        if (!notification.ReadAt.HasValue)
        {
            notification.ReadAt = DateTime.UtcNow;
            notification.Status = "read";
            _notificationRepo.Update(notification);
            await _unitOfWork.SaveChangesAsync();
        }
        return true;
    }

    /// <inheritdoc />
    public async Task MarkAllReadAsync(Guid userId)
    {
        var items = await _notificationRepo.FindAsync(n => n.UserId == userId && n.Status == "unread");
        var now   = DateTime.UtcNow;
        foreach (var n in items)
        {
            n.ReadAt = now;
            n.Status = "read";
            _notificationRepo.Update(n);
        }
        if (items.Any())
            await _unitOfWork.SaveChangesAsync();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private async Task SaveNotificationAsync(
        Guid userId, string title, string content, string type, string linkTo, DateTime now)
    {
        var entity = new Notification
        {
            Id        = Guid.NewGuid(),
            UserId    = userId,
            Title     = title,
            Content   = content,
            Type      = type,
            Status    = "unread",
            LinkTo    = linkTo,
            CreatedAt = now,
            ReadAt    = null
        };
        await _notificationRepo.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<Guid?> GetUserIdByCustomerIdAsync(Guid customerId)
    {
        var customer = await _customerRepo.GetByIdAsync(customerId);
        return customer?.UserId;
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id        = n.Id,
        UserId    = n.UserId,
        Title     = n.Title,
        Content   = n.Content,
        Type      = n.Type,
        Status    = n.Status,
        LinkTo    = n.LinkTo,
        CreatedAt = n.CreatedAt,
        ReadAt    = n.ReadAt
    };

    private static string BuildOrderTitle(string status) => status switch
    {
        "Confirmed"          => "Đơn hàng đã được xác nhận",
        "ProcessingTemplate" => "Đơn hàng đang chuẩn bị",
        "Manufacturing"      => "Đơn hàng đang sản xuất",
        "Shipped"            => "Đơn hàng đang giao",
        "Delivered"          => "Đơn hàng đã giao thành công",
        "Cancelled"          => "Đơn hàng đã bị huỷ",
        "Rejected"           => "Đơn hàng đã bị từ chối",
        _                    => "Cập nhật đơn hàng"
    };

    private static string BuildOrderMessage(string status) => status switch
    {
        "Confirmed"          => "Đơn hàng của bạn đã được xác nhận.",
        "ProcessingTemplate" => "Đơn hàng đang được chuẩn bị mẫu.",
        "Manufacturing"      => "Đơn hàng đang được sản xuất.",
        "Shipped"            => "Đơn hàng đã được giao cho đơn vị vận chuyển.",
        "Delivered"          => "Đơn hàng đã được giao thành công. Cảm ơn bạn!",
        "Cancelled"          => "Đơn hàng đã bị huỷ.",
        "Rejected"           => "Đơn hàng đã bị từ chối.",
        _                    => $"Trạng thái đơn hàng cập nhật: {status}."
    };
}
