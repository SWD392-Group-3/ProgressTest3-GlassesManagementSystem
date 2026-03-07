using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;

        public PrescriptionService(
            IPrescriptionRepository prescriptionRepository,
            ICustomerRepository customerRepository,
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            INotificationService notificationService)
        {
            _prescriptionRepository = prescriptionRepository;
            _customerRepository = customerRepository;
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
        }

        public async Task<PrescriptionDto> CreateAsync(Guid userId, CreatePrescriptionRequest request)
        {
            var customer = await _customerRepository.GetByUserIdAsync(userId);
            if (customer == null)
                throw new Exception("Khách hàng không tồn tại.");

            var prescription = new Prescription
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                ServiceId = request.ServiceId,
                CangKinh = request.CangKinh,
                BanLe = request.BanLe,
                VienGong = request.VienGong,
                ChanVeMui = request.ChanVeMui,
                CauGong = request.CauGong,
                DuoiGong = request.DuoiGong,
                Note = request.Note,
                Status = "PrescriptionPending",
                CreatedAt = DateTime.UtcNow,
            };

            await _prescriptionRepository.AddAsync(prescription);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(prescription);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetByCustomerAsync(Guid userId)
        {
            var customer = await _customerRepository.GetByUserIdAsync(userId);
            if (customer == null)
                return Enumerable.Empty<PrescriptionDto>();

            var prescriptions = await _prescriptionRepository.FindAsync(p => p.CustomerId == customer.Id);
            return prescriptions.Select(MapToDto);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetAllAsync()
        {
            var prescriptions = await _prescriptionRepository.GetAllAsync();
            return prescriptions.Select(MapToDto);
        }

        public async Task<PrescriptionDto?> GetByIdAsync(Guid id)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
                return null;

            return MapToDto(prescription);
        }

        public async Task<PrescriptionDto> UpdateAsync(Guid id, Guid userId, UpdatePrescriptionRequest request)
        {
            var customer = await _customerRepository.GetByUserIdAsync(userId);
            if (customer == null)
                throw new Exception("Khách hàng không tồn tại.");

            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
                throw new Exception("Đơn prescription không tồn tại.");

            if (prescription.CustomerId != customer.Id)
                throw new Exception("Bạn không có quyền sửa đơn này.");

            if (prescription.Status != "PrescriptionPending")
                throw new Exception("Chỉ có thể sửa đơn khi đang ở trạng thái PrescriptionPending.");

            prescription.CangKinh = request.CangKinh ?? prescription.CangKinh;
            prescription.BanLe = request.BanLe ?? prescription.BanLe;
            prescription.VienGong = request.VienGong ?? prescription.VienGong;
            prescription.ChanVeMui = request.ChanVeMui ?? prescription.ChanVeMui;
            prescription.CauGong = request.CauGong ?? prescription.CauGong;
            prescription.DuoiGong = request.DuoiGong ?? prescription.DuoiGong;
            prescription.Note = request.Note ?? prescription.Note;
            prescription.UpdatedAt = DateTime.UtcNow;

            _prescriptionRepository.Update(prescription);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(prescription);
        }

        public async Task<PrescriptionDto> ConfirmAsync(Guid id, ConfirmPrescriptionRequest request)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
                throw new Exception("Đơn prescription không tồn tại.");

            if (prescription.Status != "PrescriptionPending")
                throw new Exception("Chỉ có thể duyệt đơn khi đang ở trạng thái PrescriptionPending.");

            // Lấy giá sản phẩm
            decimal unitPrice = 0;

            var productVariant = await _unitOfWork
                .GetRepository<ProductVariant>()
                .GetByIdAsync(request.ProductVariantId);
            unitPrice += productVariant?.Price ?? 0;

            var lensVariant = await _unitOfWork
                .GetRepository<LensVariant>()
                .GetByIdAsync(request.LensesVariantId);
            unitPrice += lensVariant?.Price ?? 0;

            // Tạo Order
            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = prescription.CustomerId,
                Status = "Confirmed",
                OrderDate = DateTime.UtcNow,
                ShippingAddress = request.ShippingAddress,
                ShippingPhone = request.ShippingPhone,
                Note = request.Note,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductVariantId = request.ProductVariantId,
                        LensesVariantId = request.LensesVariantId,
                        Quantity = 1,
                        UnitPrice = unitPrice,
                        TotalPrice = unitPrice,
                        Note = $"Prescription #{prescription.Id}",
                    }
                }
            };

            order.OrderItems.First().OrderId = order.Id;
            order.TotalAmount = order.OrderItems.Sum(oi => oi.TotalPrice);

            // Cập nhật prescription
            prescription.Status = "PrescriptionConfirmed";
            prescription.OrderId = order.Id;
            prescription.UpdatedAt = DateTime.UtcNow;

            await _orderRepository.AddAsync(order);
            _prescriptionRepository.Update(prescription);
            await _unitOfWork.SaveChangesAsync();

            // Thông báo real-time tới khách hàng: đơn prescription đã được duyệt, Order mới tạo
            await _notificationService.SendOrderStatusChangedAsync(
                order.CustomerId, order.Id, "Confirmed");

            return MapToDto(prescription);
        }

        public async Task<bool> RejectAsync(Guid id, RejectPrescriptionRequest request)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
                return false;

            if (prescription.Status != "PrescriptionPending")
                throw new Exception("Chỉ có thể từ chối đơn khi đang ở trạng thái PrescriptionPending.");

            prescription.Status = "PrescriptionRejected";
            prescription.Note = request.Reason ?? prescription.Note;
            prescription.UpdatedAt = DateTime.UtcNow;

            _prescriptionRepository.Update(prescription);
            await _unitOfWork.SaveChangesAsync();

            // Thông báo real-time tới khách hàng: yêu cầu kính đơn bị từ chối
            await _notificationService.SendPrescriptionRejectedAsync(
                prescription.CustomerId, prescription.Id, request.Reason);

            return true;
        }

        private static PrescriptionDto MapToDto(Prescription p) => new()
        {
            Id = p.Id,
            CustomerId = p.CustomerId,
            ServiceId = p.ServiceId,
            CangKinh = p.CangKinh,
            BanLe = p.BanLe,
            VienGong = p.VienGong,
            ChanVeMui = p.ChanVeMui,
            CauGong = p.CauGong,
            DuoiGong = p.DuoiGong,
            Note = p.Note,
            Status = p.Status,
            OrderId = p.OrderId,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
        };
    }
}
