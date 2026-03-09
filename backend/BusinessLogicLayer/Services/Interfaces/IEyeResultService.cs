using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IEyeResultService
    {
        Task<IEnumerable<EyeResultDto>> GetByOrderIdAsync(Guid orderId);
        Task<EyeResultDto?> GetByIdAsync(Guid id);
        Task<EyeResultDto> CreateAsync(Guid staffUserId, CreateEyeResultRequest request);
        Task<EyeResultDto?> UpdateAsync(Guid id, Guid staffUserId, UpdateEyeResultRequest request);
        Task<bool> DeleteAsync(Guid id, Guid staffUserId);
    }
}
