using System.Security.Claims;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Lấy danh sách thông báo của người dùng hiện tại (tối đa 50 thông báo gần nhất).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyNotifications([FromQuery] int limit = 50)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var notifications = await _notificationService.GetByUserIdAsync(userId, limit);
        return Ok(notifications);
    }

    /// <summary>
    /// Đánh dấu một thông báo đã đọc.
    /// </summary>
    [HttpPatch("{notificationId:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkRead(Guid notificationId)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var success = await _notificationService.MarkReadAsync(notificationId, userId);
        if (!success)
            return NotFound(new { message = "Notification not found." });

        return NoContent();
    }

    /// <summary>
    /// Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc.
    /// </summary>
    [HttpPatch("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkAllRead()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        await _notificationService.MarkAllReadAsync(userId);
        return NoContent();
    }
}
