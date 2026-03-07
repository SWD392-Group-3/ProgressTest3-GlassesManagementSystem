using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    /// <summary>
    /// Lấy danh sách slot còn trống theo ngày (để khách chọn khi đặt dịch vụ).
    /// Query: date = yyyy-MM-dd
    /// </summary>
    [HttpGet("available")]
    [ProducesResponseType(typeof(IReadOnlyList<SlotDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableSlots([FromQuery] string date, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(date) || !DateOnly.TryParse(date, out var dateParsed))
            return BadRequest(new { message = "Tham số date không hợp lệ (yyyy-MM-dd)." });

        if (dateParsed < DateOnly.FromDateTime(DateTime.Today))
            return BadRequest(new { message = "Không thể chọn ngày trong quá khứ." });

        var slots = await _slotService.GetAvailableSlotsAsync(dateParsed, cancellationToken);
        return Ok(slots);
    }
}
