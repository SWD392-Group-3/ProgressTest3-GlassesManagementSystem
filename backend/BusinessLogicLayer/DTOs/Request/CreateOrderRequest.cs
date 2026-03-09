using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Request
{
    public class CreateOrderRequest
    {
        public Guid CartId { get; set; }
        public Guid? PromotionId { get; set; }
        /// <summary>Bắt buộc khi đơn có sản phẩm giao hàng; bỏ qua khi đơn chỉ gồm dịch vụ + slot.</summary>
        public string? ShippingAddress { get; set; }
        /// <summary>Bắt buộc khi đơn có sản phẩm giao hàng; bỏ qua khi đơn chỉ gồm dịch vụ + slot.</summary>
        public string? ShippingPhone { get; set; }
        public string? Note { get; set; }
    }
}
