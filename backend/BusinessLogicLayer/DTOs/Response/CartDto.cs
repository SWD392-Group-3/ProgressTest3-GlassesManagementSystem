using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Response
{
    public class CartDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public IEnumerable<CartItemDto> CartItems { get; set; } = new List<CartItemDto>();
    }
}
