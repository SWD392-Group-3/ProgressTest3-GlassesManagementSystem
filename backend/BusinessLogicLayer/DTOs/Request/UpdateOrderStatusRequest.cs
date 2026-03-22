using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class UpdateOrderStatusRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        public string Status { get; set; } = null!;
    }
}
