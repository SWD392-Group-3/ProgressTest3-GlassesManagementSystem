using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ISlotService
    {
        /// <summary>
        /// Lấy danh sách slot còn trống theo ngày (Status = Available hoặc null).
        /// </summary>
        Task<IReadOnlyList<SlotDto>> GetAvailableSlotsAsync(DateOnly date, CancellationToken cancellationToken = default);

        /// <summary>
        /// Manager: Lấy slot theo khoảng ngày (để quản lý lịch).
        /// </summary>
        Task<IReadOnlyList<SlotDto>> GetSlotsByDateRangeAsync(DateOnly dateFrom, DateOnly dateTo, CancellationToken cancellationToken = default);

        /// <summary>
        /// Manager: Tạo slot mới.
        /// </summary>
        Task<SlotDto> CreateSlotAsync(CreateSlotRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Manager: Cập nhật slot.
        /// </summary>
        Task<SlotDto> UpdateSlotAsync(Guid id, UpdateSlotRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Manager: Xóa slot (chỉ khi chưa được đặt trong đơn/cart).
        /// </summary>
        Task<bool> DeleteSlotAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
