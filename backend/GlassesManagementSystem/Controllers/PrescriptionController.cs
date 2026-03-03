using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GlassesManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        /// <summary>
        /// Khách hàng tạo mới yêu cầu Prescription (thông số gọng kính).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Create([FromBody] CreatePrescriptionRequest request)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

                var userId = Guid.Parse(userIdStr);
                var result = await _prescriptionService.CreateAsync(userId, request);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Khách hàng xem danh sách Prescription của chính mình.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyPrescriptions()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            var results = await _prescriptionService.GetByCustomerAsync(userId);
            return Ok(results);
        }

        /// <summary>
        /// Staff (Saler) xem toàn bộ danh sách Prescription của tất cả khách hàng.
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetAll()
        {
            var results = await _prescriptionService.GetAllAsync();
            return Ok(results);
        }

        /// <summary>
        /// Lấy chi tiết một đơn Prescription theo ID.
        /// </summary>
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Customer,Staff")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _prescriptionService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Khách hàng tự cập nhật/sửa thông số Prescription (chỉ khi trạng thái là Pending).
        /// </summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePrescriptionRequest request)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

                var userId = Guid.Parse(userIdStr);
                var result = await _prescriptionService.UpdateAsync(id, userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Staff (Saler) duyệt Prescription. Hệ thống sẽ tự động tạo Order tương ứng với Gọng và Tròng đã chọn.
        /// </summary>
        [HttpPatch("{id:guid}/confirm")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> Confirm(Guid id, [FromBody] ConfirmPrescriptionRequest request)
        {
            try
            {
                var result = await _prescriptionService.ConfirmAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Staff (Saler) từ chối yêu cầu Prescription.
        /// </summary>
        [HttpPatch("{id:guid}/reject")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectPrescriptionRequest request)
        {
            try
            {
                var result = await _prescriptionService.RejectAsync(id, request);
                if (!result) return NotFound();
                return Ok(new { message = "Đã từ chối đơn prescription." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
