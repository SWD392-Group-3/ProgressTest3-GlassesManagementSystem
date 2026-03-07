using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/slots")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class SlotManagerController : ControllerBase
    {
        private readonly ISlotService _slotService;

        public SlotManagerController(ISlotService slotService)
        {
            _slotService = slotService;
        }

        /// <summary>
        /// Lấy danh sách slot theo khoảng ngày (dateFrom, dateTo format yyyy-MM-dd).
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<SlotDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSlots([FromQuery] string? dateFrom, [FromQuery] string? dateTo, CancellationToken cancellationToken = default)
        {
            var from = DateOnly.FromDateTime(DateTime.Today);
            var to = from.AddMonths(1);
            if (!string.IsNullOrWhiteSpace(dateFrom) && DateOnly.TryParse(dateFrom, out var df))
                from = df;
            if (!string.IsNullOrWhiteSpace(dateTo) && DateOnly.TryParse(dateTo, out var dt))
                to = dt;
            if (from > to)
                return BadRequest(new { message = "dateFrom phải nhỏ hơn hoặc bằng dateTo." });

            var slots = await _slotService.GetSlotsByDateRangeAsync(from, to, cancellationToken);
            return Ok(slots);
        }

        /// <summary>
        /// Tạo slot mới.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(SlotDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request, CancellationToken cancellationToken = default)
        {
            if (request == null) return BadRequest();
            try
            {
                var result = await _slotService.CreateSlotAsync(request, cancellationToken);
                return StatusCode(StatusCodes.Status201Created, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật slot.
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(SlotDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateSlot(Guid id, [FromBody] UpdateSlotRequest request, CancellationToken cancellationToken = default)
        {
            if (request == null) return BadRequest();
            try
            {
                var result = await _slotService.UpdateSlotAsync(id, request, cancellationToken);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Không tìm thấy slot." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa slot (chỉ khi chưa được đặt trong giỏ/đơn).
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteSlot(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var deleted = await _slotService.DeleteSlotAsync(id, cancellationToken);
                if (!deleted) return NotFound(new { message = "Không tìm thấy slot." });
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
