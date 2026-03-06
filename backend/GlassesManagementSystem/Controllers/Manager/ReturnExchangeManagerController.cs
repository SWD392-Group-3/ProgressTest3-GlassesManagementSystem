using BusinessLogicLayer.DTOs;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GlassesManagementSystem.Controllers.Manager
{
    /// <summary>
    /// Return/Exchange Request Handling — UC: Manager reviews, approves/rejects requests
    /// per business rules and payment status.
    /// </summary>
    [Route("api/manager/return-exchanges")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class ReturnExchangeManagerController : ControllerBase
    {
        private readonly IReturnExchangeService _returnExchangeService;

        public ReturnExchangeManagerController(IReturnExchangeService returnExchangeService)
        {
            _returnExchangeService = returnExchangeService;
        }

        // ─── VIEW ALL REQUESTS ────────────────────────────────────────────────
        // UC: "The manager views the list of return requests."

        /// <summary>
        /// Lấy danh sách tất cả yêu cầu đổi/trả đang chờ xử lý (Pending).
        /// Manager dùng để xét duyệt theo điều kiện và payment status.
        /// </summary>
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending(CancellationToken cancellationToken)
        {
            var (response, error) = await _returnExchangeService.GetPendingReturnExchangesAsync(cancellationToken);
            if (response == null) return BadRequest(new { message = error });
            return Ok(response);
        }

        /// <summary>
        /// Lấy danh sách yêu cầu đã được Sales phê duyệt (ApprovedBySales),
        /// sẵn sàng cho Operation xử lý tiếp.
        /// </summary>
        [HttpGet("approved")]
        public async Task<IActionResult> GetApproved(CancellationToken cancellationToken)
        {
            var (response, error) = await _returnExchangeService.GetApprovedReturnExchangesAsync(cancellationToken);
            if (response == null) return BadRequest(new { message = error });
            return Ok(response);
        }

        /// <summary>
        /// Lấy chi tiết một yêu cầu đổi/trả cụ thể theo ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var (response, error) = await _returnExchangeService.GetReturnExchangeByIdAsync(id, cancellationToken);
            if (response == null) return NotFound(new { message = error });
            return Ok(response);
        }

        // ─── APPROVE / REJECT ─────────────────────────────────────────────────
        // UC: "Approve or reject; update return_exchanges.status."
        // UC: "Check the conditions according to business rules and payment status."

        /// <summary>
        /// Manager phê duyệt hoặc từ chối một yêu cầu đổi/trả.
        /// Body: { returnExchangeId, isApproved, rejectionReason? }
        /// </summary>
        [HttpPost("review")]
        public async Task<IActionResult> Review(
            [FromBody] ReviewReturnExchangeRequest request,
            CancellationToken cancellationToken)
        {
            var managerId = Guid.TryParse(
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var uid) ? uid : Guid.NewGuid();

            var (response, error) = await _returnExchangeService.ReviewReturnExchangeAsync(
                request, managerId, cancellationToken);

            if (response == null) return BadRequest(new { message = error });
            return Ok(response);
        }
    }
}
