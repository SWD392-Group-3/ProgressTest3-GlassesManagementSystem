using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class CreateManualOrderRequest
    {
        [Required]
        public Guid CustomerId { get; set; }

        public Guid? PromotionId { get; set; }

        [Required]
        public string ShippingAddress { get; set; } = null!;

        [Required]
        public string ShippingPhone { get; set; } = null!;

        public string? Note { get; set; }

        [Required, MinLength(1, ErrorMessage = "Phải có ít nhất 1 sản phẩm.")]
        public List<ManualOrderItemRequest> Items { get; set; } = new();
    }

    public class ManualOrderItemRequest
    {
        public Guid? ProductId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public Guid? ComboItemId { get; set; }
        public Guid? ServiceId { get; set; }
        public Guid? SlotId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
        public int Quantity { get; set; } = 1;

        public string? Note { get; set; }
    }
}
