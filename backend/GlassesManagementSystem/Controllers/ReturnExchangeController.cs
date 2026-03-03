using System.Security.Claims;
using BusinessLogicLayer.DTOs;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        private Guid GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        /// <summary>
        /// Khách hàng tạo yêu cầu hoàn hàng
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateReturnExchange(
            [FromBody] CreateReturnExchangeRequest request,
            CancellationToken cancellationToken
        )
        {
            // TODO: Get customerId from authentication claims
            // var customerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty);

            var customerId = GetUserIdFromClaims();

            if (request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Phải có ít nhất một sản phẩm để hoàn trả" });

            var (response, error) = await _returnExchangeService.CreateReturnExchangeAsync(
                request,
                customerId,
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
        /// Khách hàng lấy danh sách yêu cầu hoàn hàng của mình
        /// </summary>
        [HttpGet("customer/{customerId}")]
        [ProducesResponseType(typeof(IEnumerable<ReturnExchangeResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCustomerReturnExchanges(
            Guid customerId,
            CancellationToken cancellationToken
        )
        {
            var (response, error) = await _returnExchangeService.GetCustomerReturnExchangesAsync(
                customerId,
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
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ReviewReturnExchange(
            [FromBody] ReviewReturnExchangeRequest request,
            CancellationToken cancellationToken
        )
        {
            // TODO: Get salesUserId from authentication claims
            var salesUserId = GetUserIdFromClaims(); // Replace with actual sales user ID from auth

            var (response, error) = await _returnExchangeService.ReviewReturnExchangeAsync(
                request,
                salesUserId,
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
        [ProducesResponseType(typeof(ReturnExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ReceiveReturnExchange(
            [FromBody] ReceiveReturnExchangeRequest request,
            CancellationToken cancellationToken
        )
        {
            // TODO: Get operationUserId from authentication claims
            var operationUserId = GetUserIdFromClaims(); // Replace with actual operation user ID from auth

            var (response, error) = await _returnExchangeService.ReceiveReturnExchangeAsync(
                request,
                operationUserId,
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
        public async Task<IActionResult> AddImages(
            [FromBody] AddImageRequest request,
            [FromQuery] string role,
            CancellationToken cancellationToken
        )
        {
            var userId = GetUserIdFromClaims();

            var allowedRoles = new[] { "Customer", "Sales", "Operation" };
            if (!allowedRoles.Contains(role))
                return BadRequest(
                    new { message = "Role không hợp lệ. Chỉ chấp nhận: Customer, Sales, Operation" }
                );

            if (request.ImageUrls == null || !request.ImageUrls.Any())
                return BadRequest(new { message = "Phải có ít nhất một hình ảnh" });

            if (request.ImageUrls.Count > 5)
                return BadRequest(new { message = "Tối đa 5 hình ảnh" });

            var (success, error) = await _returnExchangeService.AddImagesAsync(
                request.ReturnExchangeItemId,
                request.ImageUrls,
                role,
                userId,
                request.Description,
                cancellationToken
            );

            if (!success)
                return BadRequest(new { message = error });

            return Ok(new { message = "Thêm hình ảnh thành công" });
        }

        /// <summary>
        /// Upload hình ảnh lên Cloudinary cho sản phẩm hoàn hàng
        /// </summary>
        [HttpPost("upload-images")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages(
            [FromForm] Guid returnExchangeItemId,
            [FromForm] List<IFormFile> images,
            [FromForm] string role,
            [FromForm] string? description,
            CancellationToken cancellationToken
        )
        {
            var userId = GetUserIdFromClaims();

            var allowedRoles = new[] { "Customer", "Sales", "Operation" };
            if (!allowedRoles.Contains(role))
                return BadRequest(
                    new { message = "Role không hợp lệ. Chỉ chấp nhận: Customer, Sales, Operation" }
                );

            if (images == null || !images.Any())
                return BadRequest(new { message = "Phải có ít nhất một hình ảnh" });

            if (images.Count > 5)
                return BadRequest(new { message = "Tối đa 5 hình ảnh" });

            // Upload to Cloudinary
            var (urls, uploadError) = await _cloudinaryService.UploadMultipleImagesAsync(
                images,
                $"{role.ToLower()}/{returnExchangeItemId}",
                cancellationToken
            );

            if (uploadError != null || urls == null)
                return BadRequest(new { message = uploadError ?? "Lỗi khi upload ảnh" });

            // Save URLs to database
            var (success, error) = await _returnExchangeService.AddImagesAsync(
                returnExchangeItemId,
                urls,
                role,
                userId,
                description,
                cancellationToken
            );

            if (!success)
                return BadRequest(new { message = error });

            return Ok(new { message = "Upload hình ảnh thành công", imageUrls = urls });
        }
    }
}
