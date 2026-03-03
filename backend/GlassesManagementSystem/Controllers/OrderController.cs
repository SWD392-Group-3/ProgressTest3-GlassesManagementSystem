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
    /// Lấy danh sách tất cả đơn hàng (dành cho operation/staff saler).
    /// </summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Operation,Staff")]
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
    [Authorize(Roles = "Customer,Staff,Operation")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid orderId)
    {
        var order = await _orderService.GetByIdAsync(orderId);
        if (order == null)
            return NotFound(new { message = "Không tìm thấy đơn hàng." });

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

        var customerId = Guid.Parse(userIdStr);

        var orders = await _orderService.GetByCustomerAsync(customerId);
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

            var customerId = Guid.Parse(userIdStr);

            var order = await _orderService.CreateFromCartAsync(customerId, request);
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

            var customerId = Guid.Parse(userIdStr);

            request.CustomerId = customerId;

            var order = await _orderService.CreateManualOrderAsync(request);
            return StatusCode(StatusCodes.Status201Created, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật trạng thái đơn hàng (dành cho Operation Staff).
    /// Các trạng thái hợp lệ: Processing, Shipped, Delivered.
    /// </summary>
    [HttpPatch("{orderId:guid}/status")]
    [Authorize(Roles = "Operation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid orderId,
        [FromBody] UpdateOrderStatusRequest request
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _orderService.UpdateStatusAsync(orderId, request.Status);
            if (!result)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            return Ok(new { message = $"Đã cập nhật trạng thái thành '{request.Status}'." });
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

            var customerId = Guid.Parse(userIdStr);

            var result = await _orderService.CancelOrderAsync(orderId, customerId);
            if (!result)
                return NotFound(
                    new { message = "Không tìm thấy đơn hàng hoặc bạn không có quyền huỷ." }
                );

            return Ok(new { message = "Đơn hàng đã được huỷ." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Staff (Saler) xác nhận đơn hàng thường.
    /// </summary>
    [HttpPatch("{orderId:guid}/confirm")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Confirm(Guid orderId)
    {
        try
        {
            var result = await _orderService.ConfirmOrderAsync(orderId);
            if (!result) return NotFound(new { message = "Không tìm thấy đơn hàng." });
            return Ok(new { message = "Đã xác nhận đơn hàng." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Staff (Saler) từ chối đơn hàng thường.
    /// </summary>
    [HttpPatch("{orderId:guid}/reject")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Reject(Guid orderId, [FromBody] string? reason)
    {
        try
        {
            var result = await _orderService.RejectOrderAsync(orderId, reason);
            if (!result) return NotFound(new { message = "Không tìm thấy đơn hàng." });
            return Ok(new { message = "Đã từ chối đơn hàng." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
