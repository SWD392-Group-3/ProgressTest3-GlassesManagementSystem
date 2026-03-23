using System.Security.Claims;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Lấy danh sách tất cả đơn hàng (dành cho Operation/Sales).
    /// </summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Operation,Sales")]
    [ProducesResponseType(typeof(IEnumerable<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOrders()
    {
        try
        {
            var orders = await _orderService.GetAllAsync();
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy chi tiết một đơn hàng theo ID.
    /// </summary>
    [HttpGet("{orderId:guid}")]
    [Authorize(Roles = "Customer,Sales,Operation")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid orderId)
    {
        var order = await _orderService.GetByIdAsync(orderId);
        if (order == null)
            return NotFound(new { message = "Order not found." });

        return Ok(order);
    }

    /// <summary>
    /// Lấy danh sách tất cả đơn hàng của một khách hàng.
    /// </summary>
    [HttpGet("customer")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(IEnumerable<OrderDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCustomer()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);

        var orders = await _orderService.GetByCustomerAsync(userId);
        return Ok(orders);
    }

    /// <summary>
    /// Tạo đơn hàng từ giỏ hàng (checkout).
    /// </summary>
    [HttpPost("from-cart")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateFromCart([FromBody] CreateOrderRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            var userId = Guid.Parse(userIdStr);

            var order = await _orderService.CreateFromCartAsync(userId, request);
            return StatusCode(StatusCodes.Status201Created, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Tạo đơn hàng trực tiếp, không cần qua giỏ hàng (mua ngay).
    /// </summary>
    [HttpPost("manual")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateManual([FromBody] CreateManualOrderRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            var userId = Guid.Parse(userIdStr);

            request.CustomerId = userId;

            var order = await _orderService.CreateManualOrderAsync(request);
            return StatusCode(StatusCodes.Status201Created, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật trạng thái đơn hàng.
    /// Operation: đơn giao hàng (Shipped, Delivered, ...).
    /// Sales: đơn dịch vụ có thể chuyển Confirmed → Completed (không qua Operation).
    /// </summary>
    [HttpPatch("{orderId:guid}/status")]
    [Authorize(Roles = "Operation,Sales")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid orderId,
        [FromBody] UpdateOrderStatusRequest request
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var order = await _orderService.GetByIdAsync(orderId);
        if (order == null)
            return NotFound(new { message = "Order not found." });

        var isServiceOrder =
            string.IsNullOrEmpty(order.ShippingAddress) && string.IsNullOrEmpty(order.ShippingPhone);
        if (isServiceOrder && User.IsInRole("Operation"))
            return StatusCode(403, new { message = "Service orders can only be confirmed by Sales, not Operation." });

        try
        {
            var result = await _orderService.UpdateStatusAsync(orderId, request.Status);
            if (!result)
                return NotFound(new { message = "Order not found." });

            return Ok(new { message = $"Status updated to '{request.Status}'." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Khách hàng huỷ đơn hàng của mình.
    /// </summary>
    [HttpPatch("{orderId:guid}/cancel")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid orderId)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            var userId = Guid.Parse(userIdStr);

            var result = await _orderService.CancelOrderAsync(orderId, userId);
            if (!result)
                return NotFound(
                    new { message = "Order not found or you do not have permission to cancel it." }
                );

            return Ok(new { message = "Order has been cancelled." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Sales xác nhận đơn hàng thường.
    /// </summary>
    [HttpPatch("{orderId:guid}/confirm")]
    [Authorize(Roles = "Sales")]
    public async Task<IActionResult> Confirm(Guid orderId)
    {
        try
        {
            var result = await _orderService.ConfirmOrderAsync(orderId);
            if (!result) return NotFound(new { message = "Order not found." });
            return Ok(new { message = "Order has been confirmed." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Sales từ chối đơn hàng thường.
    /// </summary>
    [HttpPatch("{orderId:guid}/reject")]
    [Authorize(Roles = "Sales")]
    public async Task<IActionResult> Reject(Guid orderId, [FromBody] string? reason)
    {
        try
        {
            var result = await _orderService.RejectOrderAsync(orderId, reason);
            if (!result) return NotFound(new { message = "Order not found." });
            return Ok(new { message = "Order has been rejected." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Khách hàng xác nhận đã nhận hàng: Delivered → Completed.
    /// Sau đó mới có thể yêu cầu đổi/trả hàng.
    /// </summary>
    [HttpPost("{orderId:guid}/complete")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid orderId)
    {
        try
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            var result = await _orderService.CompleteOrderAsync(orderId, userId);
            if (!result) return NotFound(new { message = "Order not found." });
            return Ok(new { message = "Delivery confirmed. Thank you!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
