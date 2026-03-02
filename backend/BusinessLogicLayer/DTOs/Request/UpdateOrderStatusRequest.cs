using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class UpdateOrderStatusRequest
    {
        [Required(ErrorMessage = "Trạng thái không được để trống.")]
        public string Status { get; set; } = null!;
    }
}
