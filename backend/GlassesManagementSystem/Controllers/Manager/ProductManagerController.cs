using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/products")]
    [ApiController]
    [Authorize(Roles = "admin,manager")]
    public class ProductManagerController : ControllerBase
    {
        private readonly IProductManagerService _productManagerService;

        public ProductManagerController(IProductManagerService productManagerService)
        {
            _productManagerService = productManagerService;
        }

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
            {
                return NotFound($"Product with Id {id} not found.");
            }
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
            {
                return BadRequest("ID in URL and ID in body must match.");
            }

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
            {
                return NotFound($"Product with Id {id} not found.");
            }
            return NoContent();
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _productManagerService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("brands")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _productManagerService.GetAllBrandsAsync();
            return Ok(brands);
        }
    }
}
