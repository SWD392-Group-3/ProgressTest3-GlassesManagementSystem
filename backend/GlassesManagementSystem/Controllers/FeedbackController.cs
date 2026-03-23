using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackRequest request, CancellationToken cancellationToken)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var customerUserId))
            {
                return Unauthorized(new { message = "Invalid user." });
            }

            var (success, error) = await _feedbackService.CreateFeedbackAsync(request, customerUserId, cancellationToken);
            if (!success)
            {
                return BadRequest(new { message = error });
            }

            return Ok(new { message = "Feedback submitted successfully." });
        }

        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductFeedbacks(Guid productId, CancellationToken cancellationToken)
        {
            var summary = await _feedbackService.GetProductFeedbacksAsync(productId, cancellationToken);
            return Ok(summary);
        }

        [HttpGet("can-feedback")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CheckCanFeedback([FromQuery] Guid orderItemId, CancellationToken cancellationToken)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var customerUserId))
            {
                return Unauthorized(new { message = "Invalid user." });
            }

            bool canFeedback = await _feedbackService.CanCustomerFeedbackAsync(customerUserId, orderItemId, cancellationToken);
            return Ok(new { canFeedback });
        }

        [HttpGet("all")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> GetAllFeedbacks(CancellationToken cancellationToken)
        {
            var feedbacks = await _feedbackService.GetAllFeedbacksAsync(cancellationToken);
            return Ok(feedbacks);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> ApproveFeedback(Guid id, CancellationToken cancellationToken)
        {
            var (success, error) = await _feedbackService.ApproveFeedbackAsync(id, cancellationToken);
            if (!success) return BadRequest(new { message = error });
            return Ok(new { message = "Feedback approved successfully." });
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> RejectFeedback(Guid id, CancellationToken cancellationToken)
        {
            var (success, error) = await _feedbackService.RejectFeedbackAsync(id, cancellationToken);
            if (!success) return BadRequest(new { message = error });
            return Ok(new { message = "Feedback rejected successfully." });
        }
    }
}
