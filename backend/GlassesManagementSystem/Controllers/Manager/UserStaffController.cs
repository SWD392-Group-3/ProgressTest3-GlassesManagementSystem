using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/users")]
    [ApiController]
    [Authorize(Roles = "admin,manager")]
    public class UserStaffController : ControllerBase
    {
        private readonly IUserStaffService _userStaffService;

        public UserStaffController(IUserStaffService userStaffService)
        {
            _userStaffService = userStaffService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userStaffService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userStaffService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with Id {id} not found.");
            }
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            try
            {
                var result = await _userStaffService.CreateUserAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var result = await _userStaffService.UpdateUserAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _userStaffService.DeleteUserAsync(id);
            if (!deleted)
            {
                return NotFound($"User with Id {id} not found.");
            }
            return NoContent();
        }

        // ─── ACCOUNT STATUS CONTROL (Lock / Unlock) ───────────────────────────

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> SetStatus(Guid id, [FromBody] SetAccountStatusRequest request)
        {
            try
            {
                var result = await _userStaffService.SetAccountStatusAsync(id, request.Status);
                return Ok(result);
            }
            catch (Exception ex) { return NotFound(ex.Message); }
        }
    }
}
