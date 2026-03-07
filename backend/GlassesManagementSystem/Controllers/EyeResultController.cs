using System.Security.Claims;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers;

[ApiController]
[Route("api/eye-result")]
public class EyeResultController : ControllerBase
{
    private readonly IEyeResultService _eyeResultService;

    public EyeResultController(IEyeResultService eyeResultService)
    {
        _eyeResultService = eyeResultService;
    }

    /// <summary>
    /// Lấy danh sách kết quả đo mắt theo đơn hàng.
    /// Sales/Admin xem để nhập liệu; Customer xem kết quả của mình.
    /// </summary>
    [HttpGet("order/{orderId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<EyeResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByOrder(Guid orderId)
    {
        try
        {
            var results = await _eyeResultService.GetByOrderIdAsync(orderId);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy chi tiết một kết quả đo mắt.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(EyeResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _eyeResultService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy kết quả đo mắt." });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Tạo kết quả đo mắt cho đơn hàng (Sales).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Sales")]
    [ProducesResponseType(typeof(EyeResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateEyeResultRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var result = await _eyeResultService.CreateAsync(Guid.Parse(userId), request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật kết quả đo mắt (Sales/Admin, chỉ người tạo hoặc Admin).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Sales")]
    [ProducesResponseType(typeof(EyeResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEyeResultRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var result = await _eyeResultService.UpdateAsync(id, Guid.Parse(userId), request);
            if (result == null) return NotFound(new { message = "Không tìm thấy kết quả đo mắt." });
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa kết quả đo mắt (Sales, chỉ người tạo).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Sales")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var deleted = await _eyeResultService.DeleteAsync(id, Guid.Parse(userId));
            if (!deleted) return NotFound(new { message = "Không tìm thấy kết quả đo mắt." });
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
