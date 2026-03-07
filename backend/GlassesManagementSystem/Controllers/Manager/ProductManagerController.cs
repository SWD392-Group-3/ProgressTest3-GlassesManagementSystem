using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/products")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class ProductManagerController : ControllerBase
    {
        private readonly IProductManagerService _productManagerService;

        public ProductManagerController(IProductManagerService productManagerService)
        {
            _productManagerService = productManagerService;
        }

        // ─── PRODUCT ──────────────────────────────────────────────────────────

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productManagerService.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var product = await _productManagerService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound($"Product with Id {id} not found.");
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
        {
            var result = await _productManagerService.CreateProductAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
        {
            if (id != request.Id)
                return BadRequest("ID in URL and ID in body must match.");
            try
            {
                var result = await _productManagerService.UpdateProductAsync(id, request);
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
            var deleted = await _productManagerService.DeleteProductAsync(id);
            if (!deleted)
                return NotFound($"Product with Id {id} not found.");
            return NoContent();
        }

        // ─── CATEGORY MANAGEMENT ──────────────────────────────────────────────

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _productManagerService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            var result = await _productManagerService.CreateCategoryAsync(request);
            return Ok(result);
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(
            Guid id,
            [FromBody] UpdateCategoryRequest request
        )
        {
            try
            {
                var result = await _productManagerService.UpdateCategoryAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var deleted = await _productManagerService.DeleteCategoryAsync(id);
            if (!deleted)
                return NotFound($"Category with Id {id} not found.");
            return NoContent();
        }

        // ─── BRAND MANAGEMENT ─────────────────────────────────────────────────

        [HttpGet("brands")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _productManagerService.GetAllBrandsAsync();
            return Ok(brands);
        }

        [HttpPost("brands")]
        public async Task<IActionResult> CreateBrand([FromBody] CreateBrandRequest request)
        {
            var result = await _productManagerService.CreateBrandAsync(request);
            return Ok(result);
        }

        [HttpPut("brands/{id}")]
        public async Task<IActionResult> UpdateBrand(Guid id, [FromBody] UpdateBrandRequest request)
        {
            try
            {
                var result = await _productManagerService.UpdateBrandAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("brands/{id}")]
        public async Task<IActionResult> DeleteBrand(Guid id)
        {
            var deleted = await _productManagerService.DeleteBrandAsync(id);
            if (!deleted)
                return NotFound($"Brand with Id {id} not found.");
            return NoContent();
        }

        // ─── FRAME VARIANT MANAGEMENT (Product Pricing Setup - Frames) ────────

        [HttpGet("frame-variants")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFrameVariants([FromQuery] Guid productId)
        {
            var variants = await _productManagerService.GetFrameVariantsByProductAsync(productId);
            return Ok(variants);
        }

        [HttpGet("frame-variants/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFrameVariantById(Guid id)
        {
            var variant = await _productManagerService.GetFrameVariantByIdAsync(id);
            if (variant == null)
                return NotFound($"Frame variant with Id {id} not found.");
            return Ok(variant);
        }

        [HttpPost("frame-variants")]
        public async Task<IActionResult> CreateFrameVariant(
            [FromBody] CreateFrameVariantRequest request
        )
        {
            var result = await _productManagerService.CreateFrameVariantAsync(request);
            return CreatedAtAction(nameof(GetFrameVariantById), new { id = result.Id }, result);
        }

        [HttpPut("frame-variants/{id}")]
        public async Task<IActionResult> UpdateFrameVariant(
            Guid id,
            [FromBody] UpdateFrameVariantRequest request
        )
        {
            try
            {
                var result = await _productManagerService.UpdateFrameVariantAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("frame-variants/{id}")]
        public async Task<IActionResult> DeleteFrameVariant(Guid id)
        {
            var deleted = await _productManagerService.DeleteFrameVariantAsync(id);
            if (!deleted)
                return NotFound($"Frame variant with Id {id} not found.");
            return NoContent();
        }

        // ─── LENS VARIANT MANAGEMENT (Product Pricing Setup - Lenses) ─────────

        [HttpGet("lens-variants")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLensVariants([FromQuery] Guid productId)
        {
            var variants = await _productManagerService.GetLensVariantsByProductAsync(productId);
            return Ok(variants);
        }

        [HttpGet("lens-variants/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLensVariantById(Guid id)
        {
            var variant = await _productManagerService.GetLensVariantByIdAsync(id);
            if (variant == null)
                return NotFound($"Lens variant with Id {id} not found.");
            return Ok(variant);
        }

        [HttpPost("lens-variants")]
        public async Task<IActionResult> CreateLensVariant(
            [FromBody] CreateLensVariantRequest request
        )
        {
            var result = await _productManagerService.CreateLensVariantAsync(request);
            return CreatedAtAction(nameof(GetLensVariantById), new { id = result.Id }, result);
        }

        [HttpPut("lens-variants/{id}")]
        public async Task<IActionResult> UpdateLensVariant(
            Guid id,
            [FromBody] UpdateLensVariantRequest request
        )
        {
            try
            {
                var result = await _productManagerService.UpdateLensVariantAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("lens-variants/{id}")]
        public async Task<IActionResult> DeleteLensVariant(Guid id)
        {
            var deleted = await _productManagerService.DeleteLensVariantAsync(id);
            if (!deleted)
                return NotFound($"Lens variant with Id {id} not found.");
            return NoContent();
        }
    }
}
