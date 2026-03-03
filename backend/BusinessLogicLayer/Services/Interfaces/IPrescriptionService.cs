using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPrescriptionService
    {
        Task<PrescriptionDto> CreateAsync(Guid userId, CreatePrescriptionRequest request);
        Task<IEnumerable<PrescriptionDto>> GetByCustomerAsync(Guid userId);
        Task<IEnumerable<PrescriptionDto>> GetAllAsync();
        Task<PrescriptionDto?> GetByIdAsync(Guid id);
        Task<PrescriptionDto> UpdateAsync(Guid id, Guid userId, UpdatePrescriptionRequest request);
        Task<PrescriptionDto> ConfirmAsync(Guid id, ConfirmPrescriptionRequest request);
        Task<bool> RejectAsync(Guid id, RejectPrescriptionRequest request);
    }
}
