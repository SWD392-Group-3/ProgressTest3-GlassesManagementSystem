using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class EyeResultService : IEyeResultService
    {
        private readonly IEyeResultRepository _eyeResultRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;

        public EyeResultService(
            IEyeResultRepository eyeResultRepository,
            IOrderRepository orderRepository,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            INotificationService notificationService)
        {
            _eyeResultRepository  = eyeResultRepository;
            _orderRepository      = orderRepository;
            _userRepository       = userRepository;
            _unitOfWork           = unitOfWork;
            _notificationService  = notificationService;
        }

        public async Task<IEnumerable<EyeResultDto>> GetByOrderIdAsync(Guid orderId)
        {
            var results = await _eyeResultRepository.GetByOrderIdAsync(orderId);
            return results.Select(ToDto);
        }

        public async Task<EyeResultDto?> GetByIdAsync(Guid id)
        {
            var result = await _eyeResultRepository.GetByIdWithStaffAsync(id);
            return result == null ? null : ToDto(result);
        }

        public async Task<EyeResultDto> CreateAsync(Guid staffUserId, CreateEyeResultRequest request)
        {
            var staff = await _userRepository.GetByIdAsync(staffUserId)
                ?? throw new Exception("Không tìm thấy nhân viên.");

            var order = await _orderRepository.GetByIdAsync(request.OrderId)
                ?? throw new Exception("Không tìm thấy đơn hàng.");

            var eyeResult = new EyeResult
            {
                Id = Guid.NewGuid(),
                OrderId = request.OrderId,
                StaffId = staffUserId,
                EyeLeft = request.EyeLeft,
                EyeRight = request.EyeRight,
                Vien = request.Vien,
                Loan = request.Loan,
                Can = request.Can,
                Note = request.Note,
            };

            await _eyeResultRepository.AddAsync(eyeResult);
            await _unitOfWork.SaveChangesAsync();

            // Gửi thông báo cho khách hàng
            try
            {
                await _notificationService.SendEyeResultReadyAsync(order.CustomerId, order.Id);
            }
            catch
            {
                // Không để lỗi thông báo làm fail cả request
            }

            return new EyeResultDto
            {
                Id = eyeResult.Id,
                OrderId = eyeResult.OrderId,
                StaffId = eyeResult.StaffId,
                StaffName = staff.FullName,
                EyeLeft = eyeResult.EyeLeft,
                EyeRight = eyeResult.EyeRight,
                Vien = eyeResult.Vien,
                Loan = eyeResult.Loan,
                Can = eyeResult.Can,
                Note = eyeResult.Note,
            };
        }

        public async Task<EyeResultDto?> UpdateAsync(Guid id, Guid staffUserId, UpdateEyeResultRequest request)
        {
            var eyeResult = await _eyeResultRepository.GetByIdWithStaffAsync(id);
            if (eyeResult == null) return null;

            // Chỉ người tạo hoặc Admin mới được sửa
            var staff = await _userRepository.GetByIdAsync(staffUserId);
            if (staff == null) return null;
            if (eyeResult.StaffId != staffUserId && staff.Role != "Admin")
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa kết quả này.");

            eyeResult.EyeLeft = request.EyeLeft;
            eyeResult.EyeRight = request.EyeRight;
            eyeResult.Vien = request.Vien;
            eyeResult.Loan = request.Loan;
            eyeResult.Can = request.Can;
            eyeResult.Note = request.Note;

            _eyeResultRepository.Update(eyeResult);
            await _unitOfWork.SaveChangesAsync();

            return ToDto(eyeResult);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid staffUserId)
        {
            var eyeResult = await _eyeResultRepository.GetByIdAsync(id);
            if (eyeResult == null) return false;

            var staff = await _userRepository.GetByIdAsync(staffUserId);
            if (staff == null) return false;
            if (eyeResult.StaffId != staffUserId && staff.Role != "Admin")
                throw new UnauthorizedAccessException("Bạn không có quyền xóa kết quả này.");

            _eyeResultRepository.Delete(eyeResult);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private static EyeResultDto ToDto(EyeResult e) => new EyeResultDto
        {
            Id = e.Id,
            OrderId = e.OrderId,
            StaffId = e.StaffId,
            StaffName = e.Staff?.FullName,
            EyeLeft = e.EyeLeft,
            EyeRight = e.EyeRight,
            Vien = e.Vien,
            Loan = e.Loan,
            Can = e.Can,
            Note = e.Note,
        };
    }
}
