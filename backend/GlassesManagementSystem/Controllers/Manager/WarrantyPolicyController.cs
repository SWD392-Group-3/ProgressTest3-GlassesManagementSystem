using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/policies")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class WarrantyPolicyController : ControllerBase
    {
        private readonly IWarrantyPolicyService _warrantyPolicyService;

        public WarrantyPolicyController(IWarrantyPolicyService warrantyPolicyService)
        {
            _warrantyPolicyService = warrantyPolicyService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var policies = await _warrantyPolicyService.GetAllWarrantyPoliciesAsync();
            return Ok(policies);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var policy = await _warrantyPolicyService.GetWarrantyPolicyByIdAsync(id);
            if (policy == null)
            {
                return NotFound($"Warranty policy with Id {id} not found.");
            }
            return Ok(policy);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWarrantyPolicyRequest request)
        {
            var result = await _warrantyPolicyService.CreateWarrantyPolicyAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarrantyPolicyRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest("ID in URL and ID in body must match.");
            }

            try
            {
                var result = await _warrantyPolicyService.UpdateWarrantyPolicyAsync(id, request);
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
            var deleted = await _warrantyPolicyService.DeleteWarrantyPolicyAsync(id);
            if (!deleted)
            {
                return NotFound($"Warranty policy with Id {id} not found.");
            }
            return NoContent();
        }
    }
}
