using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/pricing-promotions")]
    [ApiController]
    [Authorize(Roles = "admin,manager")]
    public class PricingPromotionController : ControllerBase
    {
        private readonly IPricingPromotionService _pricingPromotionService;

        public PricingPromotionController(IPricingPromotionService pricingPromotionService)
        {
            _pricingPromotionService = pricingPromotionService;
        }

        // ─── PROMOTIONS (Business Regulation - pricing rules) ─────────────────

        [HttpGet("promotions")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPromotions()
        {
            var promotions = await _pricingPromotionService.GetAllPromotionsAsync();
            return Ok(promotions);
        }

        [HttpPost("promotions")]
        public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionRequest request)
        {
            var result = await _pricingPromotionService.CreatePromotionAsync(request);
            return Ok(result);
        }

        [HttpDelete("promotions/{id}")]
        public async Task<IActionResult> DeletePromotion(Guid id)
        {
            var result = await _pricingPromotionService.DeletePromotionAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // ─── SERVICES ─────────────────────────────────────────────────────────

        [HttpGet("services")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServices()
        {
            var services = await _pricingPromotionService.GetAllServicesAsync();
            return Ok(services);
        }

        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
        {
            var result = await _pricingPromotionService.CreateServiceAsync(request);
            return Ok(result);
        }

        [HttpDelete("services/{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var result = await _pricingPromotionService.DeleteServiceAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // ─── COMBO MANAGEMENT (Frame + Lens) ──────────────────────────────────

        [HttpGet("combos")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCombos()
        {
            var combos = await _pricingPromotionService.GetAllCombosAsync();
            return Ok(combos);
        }

        [HttpPost("combos")]
        public async Task<IActionResult> CreateCombo([FromBody] CreateComboRequest request)
        {
            var result = await _pricingPromotionService.CreateComboAsync(request);
            return Ok(result);
        }

        [HttpPut("combos/{id}")]
        public async Task<IActionResult> UpdateCombo(Guid id, [FromBody] UpdateComboRequest request)
        {
            try
            {
                var result = await _pricingPromotionService.UpdateComboAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex) { return NotFound(ex.Message); }
        }

        [HttpDelete("combos/{id}")]
        public async Task<IActionResult> DeleteCombo(Guid id)
        {
            var result = await _pricingPromotionService.DeleteComboAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // ─── COMBO ITEMS ──────────────────────────────────────────────────────

        [HttpGet("combos/{comboId}/items")]
        [AllowAnonymous]
        public async Task<IActionResult> GetComboItems(Guid comboId)
        {
            var items = await _pricingPromotionService.GetComboItemsAsync(comboId);
            return Ok(items);
        }

        [HttpPost("combos/{comboId}/items")]
        public async Task<IActionResult> AddComboItem(Guid comboId, [FromBody] AddComboItemRequest request)
        {
            var result = await _pricingPromotionService.AddComboItemAsync(comboId, request);
            return Ok(result);
        }

        [HttpDelete("combos/{comboId}/items/{itemId}")]
        public async Task<IActionResult> RemoveComboItem(Guid comboId, Guid itemId)
        {
            var result = await _pricingPromotionService.RemoveComboItemAsync(itemId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
