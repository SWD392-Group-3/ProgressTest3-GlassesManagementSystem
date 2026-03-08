using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Request
{
    public class AddCartItemRequest
    {
        public Guid? ProductId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public Guid? LensesVariantId { get; set; }
        public Guid? ComboItemId { get; set; }
        public Guid? ServiceId { get; set; }
        public Guid? SlotId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; } = 1;

        public string? Note { get; set; }
    }
}
