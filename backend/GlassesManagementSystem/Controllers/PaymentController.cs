using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IMomoService _momoService;
    private readonly IPaymentService _paymentService;

    public PaymentController(IMomoService momoService, IPaymentService paymentService)
    {
        _momoService = momoService;
        _paymentService = paymentService;
    }

    /// <summary>
    /// Tạo link thanh toán Momo. Client nhận được PayUrl rồi redirect người dùng vào đó.
    /// </summary>
    [HttpPost("momo")]
    [ProducesResponseType(typeof(MomoCreatePaymentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMomoPayment([FromBody] MomoCreatePaymentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await _momoService.CreatePaymentAsync(request);

            if (response.ResultCode != 0)
                return BadRequest(new { message = response.Message, resultCode = response.ResultCode });

            // Chỉ trả PayUrl về client, KHÔNG tạo Payment ở đây.
            // Payment sẽ được tạo sau khi Momo IPN xác nhận thành công (momo-notify).
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Momo redirect người dùng về đây sau khi thanh toán (ReturnUrl - phía client).
    /// Xác thực + cập nhật DB (phòng trường hợp IPN chưa kịp gọi), rồi redirect frontend.
    /// </summary>
    [HttpGet("momo-callback")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MomoCallback([FromQuery] MomoCallbackResponse callback)
    {
        var orderId = callback.OrderId ?? "";

        if (callback.ResultCode == 0)
        {
            // Thử cập nhật DB nếu IPN chưa kịp xử lý (idempotent — PaymentService kiểm tra trùng)
            try { await _paymentService.HandleMomoNotifyAsync(callback); } catch { /* ignore dup */ }
            return Redirect($"http://localhost:3000/orders/{orderId}?payment=success");
        }

        return Redirect($"http://localhost:3000/orders/{orderId}?payment=failed&code={callback.ResultCode}");
    }

    /// <summary>
    /// Momo gọi server-to-server về đây (IPN NotifyUrl) để xác nhận kết quả cuối cùng.
    /// Tầng Web chỉ xác thực chữ ký rồi uỷ thác toàn bộ logic cho PaymentService.
    /// </summary>
    [HttpPost("momo-notify")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MomoNotify([FromBody] MomoCallbackResponse notify)
    {
        if (!_momoService.ValidateCallback(notify))
            return BadRequest();

        try
        {
            await _paymentService.HandleMomoNotifyAsync(notify);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
