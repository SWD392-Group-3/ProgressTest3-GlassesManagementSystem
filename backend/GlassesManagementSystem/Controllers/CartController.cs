using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    /// <summary>
    /// Lấy giỏ hàng của customer theo customerId.
    /// </summary>
    [HttpGet("{customerId:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCart(Guid customerId)
    {
        try
        {
            var cart = await _cartService.GetCartByCustomerIdAsync(customerId);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Tạo giỏ hàng nếu customer chưa có, hoặc trả về giỏ hàng hiện tại.
    /// </summary>
    [HttpPost("{customerId:guid}/create")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCart(Guid customerId)
    {
        try
        {
            var cart = await _cartService.CreateCartIfNotExistsAsync(customerId);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Thêm sản phẩm vào giỏ hàng.
    /// Có thể truyền productVariantId, lensesVariantId, comboItemId, serviceId tuỳ loại item.
    /// </summary>
    [HttpPost("{customerId:guid}/items")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddItem(Guid customerId, [FromBody] AddCartItemRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Phải có ít nhất 1 loại item
        if (request.ProductVariantId == null &&
            request.LensesVariantId == null &&
            request.ComboItemId == null &&
            request.ServiceId == null)
        {
            return BadRequest(new { message = "Phải chọn ít nhất một sản phẩm, tròng kính, combo hoặc dịch vụ." });
        }

        try
        {
            var cart = await _cartService.AddItemAsync(
                customerId,
                request.ProductVariantId,
                request.LensesVariantId,
                request.ComboItemId,
                request.ServiceId,
                request.SlotId,
                request.Quantity,
                request.Note);

            return Ok(cart);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật số lượng của một CartItem.
    /// </summary>
    [HttpPut("items/{cartItemId:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItemQuantity(Guid cartItemId, [FromBody] UpdateCartItemRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var cart = await _cartService.UpdateItemQuantityAsync(cartItemId, request.Quantity);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa một CartItem khỏi giỏ hàng.
    /// </summary>
    [HttpDelete("items/{cartItemId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveItem(Guid cartItemId)
    {
        try
        {
            var result = await _cartService.RemoveItemAsync(cartItemId);
            if (!result)
                return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ hàng." });

            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
