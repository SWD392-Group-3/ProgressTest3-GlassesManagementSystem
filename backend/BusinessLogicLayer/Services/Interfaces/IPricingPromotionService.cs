using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPricingPromotionService
    {
        Task<IEnumerable<PromotionDto>> GetAllPromotionsAsync();
        Task<PromotionDto> CreatePromotionAsync(CreatePromotionRequest request);
        Task<bool> DeletePromotionAsync(Guid id);

        Task<IEnumerable<ServiceDto>> GetAllServicesAsync();
        Task<ServiceDto> CreateServiceAsync(CreateServiceRequest request);
        Task<bool> DeleteServiceAsync(Guid id);

        Task<IEnumerable<ComboDto>> GetAllCombosAsync();
        Task<ComboDto> CreateComboAsync(CreateComboRequest request);
        Task<bool> DeleteComboAsync(Guid id);
    }
}
