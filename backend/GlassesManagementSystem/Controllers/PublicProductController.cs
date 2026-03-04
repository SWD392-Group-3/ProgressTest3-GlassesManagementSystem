using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers
{
    [Route("api/products")]
    [ApiController]
    [AllowAnonymous] // Cho phép guest, customer truy cập
    public class PublicProductController : ControllerBase
    {
        private readonly IProductManagerService _service;

        public PublicProductController(IProductManagerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _service.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var product = await _service.GetProductByIdAsync(id);
            if (product == null)
                return NotFound();
            return Ok(product);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _service.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _service.GetAllBrandsAsync();
            return Ok(brands);
        }

        [HttpGet("frame-variants")]
        public async Task<IActionResult> GetFrameVariants([FromQuery] Guid productId)
        {
            var variants = await _service.GetFrameVariantsByProductAsync(productId);
            return Ok(variants);
        }

        [HttpGet("frame-variants/{id}")]
        public async Task<IActionResult> GetFrameVariantById(Guid id)
        {
            var variant = await _service.GetFrameVariantByIdAsync(id);
            if (variant == null)
                return NotFound();
            return Ok(variant);
        }

        [HttpGet("lens-variants")]
        public async Task<IActionResult> GetLensVariants([FromQuery] Guid productId)
        {
            var variants = await _service.GetLensVariantsByProductAsync(productId);
            return Ok(variants);
        }

        [HttpGet("lens-variants/{id}")]
        public async Task<IActionResult> GetLensVariantById(Guid id)
        {
            var variant = await _service.GetLensVariantByIdAsync(id);
            if (variant == null)
                return NotFound();
            return Ok(variant);
        }
    }
}
