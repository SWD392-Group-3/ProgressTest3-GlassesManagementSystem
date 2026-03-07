using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GlassesManagementSystem.Hubs;

/// <summary>
/// SignalR Hub cho thông báo real-time.
/// - Client kết nối và join group theo customerId sau khi đăng nhập.
/// - Server gửi thông báo tới group customerId khi trạng thái đơn hàng thay đổi.
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    /// <summary>
    /// Client gọi để join group theo customerId (dùng sau khi xác thực).
    /// </summary>
    public async Task JoinCustomerGroup(string customerId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"customer_{customerId}");
    }

    /// <summary>
    /// Client rời group (tùy chọn, Hub tự xử lý khi disconnect).
    /// </summary>
    public async Task LeaveCustomerGroup(string customerId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"customer_{customerId}");
    }

    /// <summary>
    /// Sale/Admin join group "sales" để nhận thông báo khi có đơn hàng mới được thanh toán.
    /// </summary>
    public async Task JoinSalesGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "sales");
    }

    public async Task LeaveSalesGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "sales");
    }

    /// <summary>
    /// Operation join group "operation" để nhận thông báo khi khách hàng xác nhận nhận hàng.
    /// </summary>
    public async Task JoinOperationGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "operation");
    }

    public async Task LeaveOperationGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "operation");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
