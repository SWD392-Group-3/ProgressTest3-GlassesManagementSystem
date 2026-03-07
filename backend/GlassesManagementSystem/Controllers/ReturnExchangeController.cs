using System.Security.Claims;
using BusinessLogicLayer.DTOs;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReturnExchangeController : ControllerBase
    {
        private readonly IReturnExchangeService _returnExchangeService;
        private readonly ICloudinaryService _cloudinaryService;

        public ReturnExchangeController(
            IReturnExchangeService returnExchangeService,
            ICloudinaryService cloudinaryService
        )
        {
            _returnExchangeService = returnExchangeService;
            _cloudinaryService = cloudinaryService;
        }

        private Guid? GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return null;
            return userId;
        }

        /// <summary>
        /// Khách hàng tạo yêu cầu hoàn hàng
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateReturnExchange(
            [FromBody] CreateReturnExchangeRequest request,
            CancellationToken cancellationToken
        )
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            if (request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Phải có ít nhất một sản phẩm để hoàn trả" });

            var (response, error) = await _returnExchangeService.CreateReturnExchangeAsync(
                request,
                userId.Value,
                cancellationToken
            );

            if (response == null)
                return BadRequest(new { message = error });

            return CreatedAtAction(
                nameof(GetReturnExchangeById),
                new { id = response.Id },
                response
            );
        }

        /// <summary>
        /// Lấy chi tiết yêu cầu hoàn hàng theo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetReturnExchangeById(
            Guid id,
            CancellationToken cancellationToken
        )
        {
            var (response, error) = await _returnExchangeService.GetReturnExchangeByIdAsync(
                id,
                cancellationToken
            );

            if (response == null)
                return NotFound(new { message = error });

            return Ok(response);
        }

        /// <summary>
        /// Khách hàng lấy danh sách yêu cầu hoàn hàng của mình (customerId lấy từ JWT).
        /// </summary>
        [HttpGet("customer")]
        [ProducesResponseType(typeof(IEnumerable<ReturnExchangeResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCustomerReturnExchanges(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var (response, error) = await _returnExchangeService.GetCustomerReturnExchangesAsync(
                userId.Value,
                cancellationToken
            );

            if (response == null)
                return BadRequest(new { message = error });

            return Ok(response);
        }

        /// <summary>
        /// Sales lấy danh sách yêu cầu hoàn hàng chờ xử lý
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "Sales,Admin")]
        [ProducesResponseType(typeof(IEnumerable<ReturnExchangeResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPendingReturnExchanges(
            CancellationToken cancellationToken
        )
        {
            var (response, error) = await _returnExchangeService.GetPendingReturnExchangesAsync(
                cancellationToken
            );

            if (response == null)
                return BadRequest(new { message = error });

            return Ok(response);
        }

        /// <summary>
        /// Operation lấy danh sách yêu cầu hoàn hàng đã được phê duyệt
        /// </summary>
        [HttpGet("approved")]
        [Authorize(Roles = "Operation")]
        [ProducesResponseType(typeof(IEnumerable<ReturnExchangeResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetApprovedReturnExchanges(
            CancellationToken cancellationToken
        )
        {
            var (response, error) = await _returnExchangeService.GetApprovedReturnExchangesAsync(
                cancellationToken
            );

            if (response == null)
                return BadRequest(new { message = error });

            return Ok(response);
        }

        /// <summary>
        /// Sales xem xét và phê duyệt/từ chối yêu cầu hoàn hàng
        /// </summary>
        [HttpPost("review")]
        [Authorize(Roles = "Sales,Admin")]
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ReviewReturnExchange(
            [FromBody] ReviewReturnExchangeRequest request,
            CancellationToken cancellationToken
        )
        {
            var salesUserId = GetCurrentUserId();
            if (salesUserId == null)
                return Unauthorized();

            var (response, error) = await _returnExchangeService.ReviewReturnExchangeAsync(
                request,
                salesUserId.Value,
                cancellationToken
            );

            if (response == null)
                return BadRequest(new { message = error });

            return Ok(response);
        }

        /// <summary>
        /// Operation nhận và xác nhận hàng hoàn
        /// </summary>
        [HttpPost("receive")]
        [Authorize(Roles = "Operation")]
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ReceiveReturnExchange(
            [FromBody] ReceiveReturnExchangeRequest request,
            CancellationToken cancellationToken
        )
        {
            var operationUserId = GetCurrentUserId();
            if (operationUserId == null)
                return Unauthorized();

            var (response, error) = await _returnExchangeService.ReceiveReturnExchangeAsync(
                request,
                operationUserId.Value,
                cancellationToken
            );

            if (response == null)
                return BadRequest(new { message = error });

            return Ok(response);
        }

        /// <summary>
        /// Thêm hình ảnh vào sản phẩm hoàn hàng
        /// </summary>
        [HttpPost("images")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AddImages(
            [FromBody] AddImageRequest request,
            [FromQuery] string role,
            CancellationToken cancellationToken
        )
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            if (request.ImageUrls == null || !request.ImageUrls.Any())
                return BadRequest(new { message = "Phải có ít nhất một hình ảnh" });

            if (request.ImageUrls.Count > 5)
                return BadRequest(new { message = "Tối đa 5 hình ảnh" });

            var (success, error) = await _returnExchangeService.AddImagesAsync(
                request.ReturnExchangeItemId,
                request.ImageUrls,
                role,
                userId.Value,
                request.Description,
                cancellationToken
            );

            if (!success)
                return BadRequest(new { message = error });

            return Ok(new { message = "Thêm hình ảnh thành công" });
        }

        /// <summary>
        /// Upload hình ảnh lên Cloudinary cho yêu cầu hoàn hàng.
        /// Dùng cho khách hàng khi tạo yêu cầu (chỉ upload, chưa gắn với item cụ thể).
        /// </summary>
        [HttpPost("upload-images")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages(
            [FromForm] List<IFormFile> files,
            CancellationToken cancellationToken
        )
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            if (files == null || !files.Any())
                return BadRequest(new { message = "Phải có ít nhất một hình ảnh" });

            if (files.Count > 5)
                return BadRequest(new { message = "Tối đa 5 hình ảnh" });

            // Xác định thư mục theo role hiện tại (Customer / Sales / Operation / Admin)
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Customer";

            // Upload lên Cloudinary, không gắn với item cụ thể (sẽ gắn khi tạo/ cập nhật ReturnExchange)
            var (urls, uploadError) = await _cloudinaryService.UploadMultipleImagesAsync(
                files,
                $"{role.ToLower()}/{userId.Value}",
                cancellationToken
            );

            if (uploadError != null || urls == null)
                return BadRequest(new { message = uploadError ?? "Lỗi khi upload ảnh" });

            // Trả về danh sách URL cho frontend, frontend sẽ truyền lại vào Create/Review/Receive DTO
            return Ok(urls);
        }
    }
}
