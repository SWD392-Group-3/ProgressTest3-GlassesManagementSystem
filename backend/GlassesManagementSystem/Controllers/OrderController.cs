using System.Security.Claims;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
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
    /// Lấy chi tiết một đơn hàng theo ID.
    /// </summary>
    [HttpGet("{orderId:guid}")]
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
    /// Cập nhật trạng thái đơn hàng (dành cho staff/admin).
    /// Các trạng thái hợp lệ: Pending, Processing, Shipped, Delivered, Cancelled.
    /// </summary>
    [HttpPatch("{orderId:guid}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid orderId, [FromBody] UpdateOrderStatusRequest request)
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
                return NotFound(new { message = "Không tìm thấy đơn hàng hoặc bạn không có quyền huỷ." });

            return Ok(new { message = "Đơn hàng đã được huỷ." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
