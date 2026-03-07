using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers
{
    [Route("api/combos")]
    [ApiController]
    [AllowAnonymous]
    public class ComboController : ControllerBase
    {
        private readonly IComboService _comboService;

        public ComboController(IComboService comboService)
        {
            _comboService = comboService;
        }

        /// <summary>Lấy danh sách tất cả combo (kèm kính và tròng kính)</summary>
        [HttpGet]
        public async Task<IActionResult> GetAllCombos()
        {
            var combos = await _comboService.GetAllCombosAsync();
            return Ok(combos);
        }

        /// <summary>Lấy chi tiết một combo theo Id</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetComboById(Guid id)
        {
            var combo = await _comboService.GetComboByIdAsync(id);
            if (combo == null)
                return NotFound(new { message = $"Combo với Id '{id}' không tồn tại." });
            return Ok(combo);
        }
    }
}
