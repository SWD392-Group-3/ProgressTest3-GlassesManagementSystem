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
        private readonly ICustomerRepository _customerRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IOrderRepository orderRepository,
            ICustomerRepository customerRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
            _notificationService = notificationService;
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

            // Bước 3: Nếu thanh toán thành công → cập nhật Order.Status sang "Paid"
            if (notify.ResultCode == 0)
            {
                var order = await _orderRepository.GetByIdAsync(orderId);
                if (order != null)
                {
                    order.Status = "Paid";
                    _orderRepository.Update(order);

                    await _unitOfWork.SaveChangesAsync();

                    // Bước 4: Gửi thông báo real-time tới nhóm Sales
                    var customer = await _customerRepository.GetByIdAsync(order.CustomerId);
                    var customerName = customer?.FullName ?? "Khách hàng";
                    await _notificationService.SendNewOrderPaidToSalesAsync(orderId, customerName, notify.Amount);
                    return;
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
