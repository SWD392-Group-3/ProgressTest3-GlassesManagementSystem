using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class PricingPromotionService : IPricingPromotionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PricingPromotionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // Promotions
        public async Task<IEnumerable<PromotionDto>> GetAllPromotionsAsync()
        {
            var promotions = await _unitOfWork.GetRepository<Promotion>().GetAllAsync();
            return promotions.Select(p => new PromotionDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Description = p.Description,
                DiscountValue = p.DiscountValue,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status
            });
        }

        public async Task<PromotionDto> CreatePromotionAsync(CreatePromotionRequest request)
        {
            var promotion = new Promotion
            {
                Id = Guid.NewGuid(),
                Code = request.Code,
                Name = request.Name,
                Description = request.Description,
                DiscountValue = request.DiscountValue,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status ?? "Active"
            };

            await _unitOfWork.GetRepository<Promotion>().AddAsync(promotion);
            await _unitOfWork.SaveChangesAsync();

            return new PromotionDto
            {
                Id = promotion.Id,
                Code = promotion.Code,
                Name = promotion.Name,
                Description = promotion.Description,
                DiscountValue = promotion.DiscountValue,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                Status = promotion.Status
            };
        }

        public async Task<bool> DeletePromotionAsync(Guid id)
        {
            var promotion = await _unitOfWork.GetRepository<Promotion>().GetByIdAsync(id);
            if (promotion == null) return false;

            _unitOfWork.GetRepository<Promotion>().Delete(promotion);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Services (Dịch vụ)
        public async Task<IEnumerable<ServiceDto>> GetAllServicesAsync()
        {
            var services = await _unitOfWork.GetRepository<Service>().GetAllAsync();
            return services.Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Price = s.Price,
                Status = s.Status
            });
        }

        public async Task<ServiceDto> CreateServiceAsync(CreateServiceRequest request)
        {
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Status = request.Status ?? "Active"
            };

            await _unitOfWork.GetRepository<Service>().AddAsync(service);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                Status = service.Status
            };
        }

        public async Task<bool> DeleteServiceAsync(Guid id)
        {
            var service = await _unitOfWork.GetRepository<Service>().GetByIdAsync(id);
            if (service == null) return false;

            _unitOfWork.GetRepository<Service>().Delete(service);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Combos
        public async Task<IEnumerable<ComboDto>> GetAllCombosAsync()
        {
            var combos = await _unitOfWork.GetRepository<Combo>().GetAllAsync();
            return combos.Select(c => new ComboDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                BasePrice = c.BasePrice,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Status = c.Status
            });
        }

        public async Task<ComboDto> CreateComboAsync(CreateComboRequest request)
        {
            var combo = new Combo
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                BasePrice = request.BasePrice,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status ?? "Active"
            };

            await _unitOfWork.GetRepository<Combo>().AddAsync(combo);
            await _unitOfWork.SaveChangesAsync();

            return new ComboDto
            {
                Id = combo.Id,
                Name = combo.Name,
                Description = combo.Description,
                BasePrice = combo.BasePrice,
                StartDate = combo.StartDate,
                EndDate = combo.EndDate,
                Status = combo.Status
            };
        }

        public async Task<bool> DeleteComboAsync(Guid id)
        {
            var combo = await _unitOfWork.GetRepository<Combo>().GetByIdAsync(id);
            if (combo == null) return false;

            _unitOfWork.GetRepository<Combo>().Delete(combo);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
