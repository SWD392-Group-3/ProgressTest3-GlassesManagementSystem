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
        var title   = "New order pending approval";
        var message = $"Customer {customerName} just placed an order for {totalAmount:N0} VND. Please review and approve.";
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
            ? "Your prescription request has been rejected."
            : $"Your prescription request has been rejected. Reason: {reason}";
        var linkTo = "/prescriptions";
        var now    = DateTime.UtcNow;

        // 1. Lưu vào DB
        var userId = await GetUserIdByCustomerIdAsync(customerId);
        if (userId.HasValue)
        {
            await SaveNotificationAsync(
                userId.Value,
                title:   "Prescription request rejected",
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
    {
        var title   = "Customer confirmed delivery";
        var message = $"Customer {customerName} has confirmed receipt. Order completed.";
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

    /// <inheritdoc />
    public async Task SendOrderConfirmedToOperationAsync(Guid orderId, string customerName)
    {
        var title   = "Order ready for operations";
        var message = $"Sales confirmed order from {customerName}. Please continue fulfillment workflow.";
        var linkTo  = $"/operation/orders/{orderId}";
        var now     = DateTime.UtcNow;

        var operationUsers = await _userRepo.FindAsync(u => u.Role == "Operation");
        foreach (var user in operationUsers)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                Id        = Guid.NewGuid(),
                UserId    = user.Id,
                Title     = title,
                Content   = message,
                Type      = "order_confirmed",
                Status    = "unread",
                LinkTo    = linkTo,
                CreatedAt = now,
                ReadAt    = null
            });
        }
        if (operationUsers.Any())
            await _unitOfWork.SaveChangesAsync();

        await _hubContext.Clients.Group("operation").SendAsync("OrderConfirmedToOperation", new
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
        const string title   = "Eye exam results ready";
        var          message = "Staff has recorded your eye exam results. Tap to view details.";
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
    public async Task SendNewFeedbackToManagerAsync(Guid feedbackId, Guid productId, string customerName, int rating)
    {
        var title = "New customer review";
        var message = $"Customer {customerName} submitted a {rating}-star review.";
        var linkTo = "/manager/feedbacks";
        var now = DateTime.UtcNow;

        var managerUsers = await _userRepo.FindAsync(u => u.Role == "Manager" || u.Role == "manager");
        foreach (var user in managerUsers)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Title = title,
                Content = message,
                Type = "new_feedback",
                Status = "unread",
                LinkTo = linkTo,
                CreatedAt = now,
                ReadAt = null
            });
        }
        if (managerUsers.Any())
            await _unitOfWork.SaveChangesAsync();

        await _hubContext.Clients.Group("manager").SendAsync("NewFeedbackSubmitted", new
        {
            feedbackId = feedbackId.ToString(),
            productId = productId.ToString(),
            customerName,
            rating,
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
        "Confirmed"          => "Order confirmed",
        "ProcessingTemplate" => "Order in preparation",
        "Manufacturing"      => "Order in manufacturing",
        "Shipped"            => "Order shipped",
        "Delivered"          => "Order delivered",
        "Cancelled"          => "Order cancelled",
        "Rejected"           => "Order rejected",
        "Completed"          => "Order completed",
        "PartiallyReturned"  => "Partial return processed",
        "Returned"           => "Return / exchange completed",
        _                    => "Order status updated"
    };

    private static string BuildOrderMessage(string status) => status switch
    {
        "Confirmed"          => "Your order has been confirmed.",
        "ProcessingTemplate" => "Your order is being prepared.",
        "Manufacturing"      => "Your order is in manufacturing.",
        "Shipped"            => "Your order has been shipped.",
        "Delivered"          => "Your order has been delivered. Thank you!",
        "Cancelled"          => "Your order has been cancelled.",
        "Rejected"           => "Your order has been rejected.",
        "Completed"          => "Your order is completed.",
        "PartiallyReturned"  =>
            "Part of your order has been processed for return or exchange. You can still request return/exchange for remaining items if applicable.",
        "Returned"           =>
            "Return or exchange for this order has been completed. The order is now closed for new return requests.",
        _                    => $"Order status updated: {status}."
    };
}
