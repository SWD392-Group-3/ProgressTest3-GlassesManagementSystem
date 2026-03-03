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
    /// Chỉ xác thực chữ ký và trả kết quả cho user, KHÔNG ghi DB (IPN đã xử lý rồi).
    /// </summary>
    [HttpGet("momo-callback")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult MomoCallback([FromQuery] MomoCallbackResponse callback)
    {
        if (!_momoService.ValidateCallback(callback))
            return BadRequest(new { message = "Chữ ký không hợp lệ." });

        if (callback.ResultCode == 0)
            return Ok(new { message = "Thanh toán thành công.", transId = callback.TransId, orderId = callback.OrderId });

        return BadRequest(new { message = $"Thanh toán thất bại: {callback.Message}", resultCode = callback.ResultCode });
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
