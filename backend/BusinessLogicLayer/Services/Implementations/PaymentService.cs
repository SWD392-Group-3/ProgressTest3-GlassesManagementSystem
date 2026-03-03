using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task HandleMomoNotifyAsync(MomoCallbackResponse notify)
        {
            if (!Guid.TryParse(notify.OrderId, out var orderId))
                throw new Exception("OrderId không hợp lệ.");

            // Bước 1: Kiểm tra Payment đã tồn tại chưa (tránh IPN gọi nhiều lần)
            var existing = await _paymentRepository.FindAsync(p => p.OrderId == orderId);
            if (existing.Any())
                return;

            // Bước 2: Tạo Payment tương ứng kết quả từ Momo
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                Amount = notify.Amount,
                Method = "Momo",
                Status = notify.ResultCode == 0 ? "Paid" : "Failed",
                PaidAt = notify.ResultCode == 0 ? DateTime.UtcNow : null,
                Note = $"TransId: {notify.TransId} | PayType: {notify.PayType} | {notify.Message}"
            };
            await _paymentRepository.AddAsync(payment);

            // Bước 3: Nếu thanh toán thành công → cập nhật Order.Status sang "Processing"
            if (notify.ResultCode == 0)
            {
                var order = await _orderRepository.GetByIdAsync(orderId);
                if (order != null)
                {
                    order.Status = "Processing";
                    _orderRepository.Update(order);
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
