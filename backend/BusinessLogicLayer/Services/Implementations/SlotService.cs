using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class SlotService : ISlotService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SlotService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IReadOnlyList<SlotDto>> GetAvailableSlotsAsync(DateOnly date, CancellationToken cancellationToken = default)
        {
            var repo = _unitOfWork.GetRepository<Slot>();
            var slots = await repo.FindAsync(s =>
                s.Date == date &&
                (s.Status == null || s.Status == "Available"),
                cancellationToken);

            return slots
                .OrderBy(s => s.StartTime)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<IReadOnlyList<SlotDto>> GetSlotsByDateRangeAsync(DateOnly dateFrom, DateOnly dateTo, CancellationToken cancellationToken = default)
        {
            var repo = _unitOfWork.GetRepository<Slot>();
            var slots = await repo.FindAsync(s => s.Date >= dateFrom && s.Date <= dateTo, cancellationToken);
            return slots.OrderBy(s => s.Date).ThenBy(s => s.StartTime).Select(MapToDto).ToList();
        }

        public async Task<SlotDto> CreateSlotAsync(CreateSlotRequest request, CancellationToken cancellationToken = default)
        {
            if (request.EndTime <= request.StartTime)
                throw new ArgumentException("Giờ kết thúc phải sau giờ bắt đầu.");

            var repo = _unitOfWork.GetRepository<Slot>();
            var existing = await repo.FirstOrDefaultAsync(s =>
                s.Date == request.Date &&
                s.StartTime == request.StartTime &&
                s.EndTime == request.EndTime,
                cancellationToken);
            if (existing != null)
                throw new InvalidOperationException("Khung giờ này đã tồn tại trong ngày được chọn.");

            var slot = new Slot
            {
                Id = Guid.NewGuid(),
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = request.Status ?? "Available",
                Note = request.Note
            };
            await repo.AddAsync(slot, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return MapToDto(slot);
        }

        public async Task<SlotDto> UpdateSlotAsync(Guid id, UpdateSlotRequest request, CancellationToken cancellationToken = default)
        {
            var repo = _unitOfWork.GetRepository<Slot>();
            var slot = await repo.GetByIdAsync(id, cancellationToken);
            if (slot == null)
                throw new KeyNotFoundException("Không tìm thấy slot.");

            if (request.Date.HasValue) slot.Date = request.Date.Value;
            if (request.StartTime.HasValue) slot.StartTime = request.StartTime.Value;
            if (request.EndTime.HasValue) slot.EndTime = request.EndTime.Value;
            if (request.Status != null) slot.Status = request.Status;
            if (request.Note != null) slot.Note = request.Note;

            if (slot.EndTime <= slot.StartTime)
                throw new ArgumentException("Giờ kết thúc phải sau giờ bắt đầu.");

            repo.Update(slot);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return MapToDto(slot);
        }

        public async Task<bool> DeleteSlotAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var slot = await _unitOfWork.GetRepository<Slot>().GetByIdAsync(id, cancellationToken);
            if (slot == null) return false;

            var cartItems = await _unitOfWork.GetRepository<CartItem>().FindAsync(c => c.SlotId == id, cancellationToken);
            var orderItems = await _unitOfWork.GetRepository<OrderItem>().FindAsync(o => o.SlotId == id, cancellationToken);
            if (cartItems.Count > 0 || orderItems.Count > 0)
                throw new InvalidOperationException("Không thể xóa slot đã được đặt trong giỏ hàng hoặc đơn hàng.");

            _unitOfWork.GetRepository<Slot>().Delete(slot);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static SlotDto MapToDto(Slot s) => new SlotDto
        {
            Id = s.Id,
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Status = s.Status,
            Note = s.Note
        };
    }
}
