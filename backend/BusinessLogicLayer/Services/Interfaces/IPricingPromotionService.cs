using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPricingPromotionService
    {
        // Promotions (Business Regulation)
        Task<IEnumerable<PromotionDto>> GetAllPromotionsAsync();
        Task<PromotionDto> CreatePromotionAsync(CreatePromotionRequest request);
        Task<PromotionDto> UpdatePromotionAsync(Guid id, UpdatePromotionRequest request);
        Task<bool> DeletePromotionAsync(Guid id);

        // Services
        Task<IEnumerable<ServiceDto>> GetAllServicesAsync();
        Task<ServiceDto> CreateServiceAsync(CreateServiceRequest request);
        Task<ServiceDto> UpdateServiceAsync(Guid id, UpdateServiceRequest request);
        Task<bool> DeleteServiceAsync(Guid id);

        // Combo Management (Frame + Lens)
        Task<IEnumerable<ComboDto>> GetAllCombosAsync();
        Task<ComboDto> CreateComboAsync(CreateComboRequest request);
        Task<ComboDto> UpdateComboAsync(Guid id, UpdateComboRequest request);
        Task<bool> DeleteComboAsync(Guid id);

        Task<IEnumerable<ComboItemDto>> GetComboItemsAsync(Guid comboId);
        Task<ComboItemDto> AddComboItemAsync(Guid comboId, AddComboItemRequest request);
        Task<bool> RemoveComboItemAsync(Guid itemId);
    }
}
