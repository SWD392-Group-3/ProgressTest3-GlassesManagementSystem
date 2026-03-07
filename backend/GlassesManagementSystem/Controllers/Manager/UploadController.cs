using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/[controller]")]
    [ApiController]
    [Authorize(Roles = "Manager,Admin")] // Assuming only authorized users can upload
    public class UploadController : ControllerBase
    {
        private readonly ICloudinaryService _cloudinaryService;

        public UploadController(ICloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // You can add validation for file types here (e.g., checking content type)
            if (!file.ContentType.StartsWith("image/"))
            {
                 return BadRequest("File must be an image.");
            }

            var (url, error) = await _cloudinaryService.UploadImageAsync(file, "products");

            if (error != null)
            {
                return StatusCode(500, new { Message = "Failed to upload image", Error = error });
            }

            return Ok(new { Url = url });
        }
    }
}
