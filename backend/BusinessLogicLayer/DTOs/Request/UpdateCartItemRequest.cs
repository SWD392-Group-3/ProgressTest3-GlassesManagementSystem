using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class UpdateCartItemRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
        public int Quantity { get; set; }
    }
}
