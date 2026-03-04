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

        // ─── PROMOTIONS ───────────────────────────────────────────────────────

        public async Task<IEnumerable<PromotionDto>> GetAllPromotionsAsync()
        {
            var promotions = await _unitOfWork.GetRepository<Promotion>().GetAllAsync();
            return promotions.Select(MapToPromotionDto);
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
            return MapToPromotionDto(promotion);
        }

        public async Task<bool> DeletePromotionAsync(Guid id)
        {
            var promotion = await _unitOfWork.GetRepository<Promotion>().GetByIdAsync(id);
            if (promotion == null) return false;

            _unitOfWork.GetRepository<Promotion>().Delete(promotion);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<PromotionDto> UpdatePromotionAsync(Guid id, UpdatePromotionRequest request)
        {
            var promotion = await _unitOfWork.GetRepository<Promotion>().GetByIdAsync(id);
            if (promotion == null) throw new Exception("Promotion not found");

            promotion.Code = request.Code;
            promotion.Name = request.Name;
            promotion.Description = request.Description;
            promotion.DiscountValue = request.DiscountValue;
            promotion.StartDate = request.StartDate;
            promotion.EndDate = request.EndDate;
            if (request.Status != null) promotion.Status = request.Status;

            _unitOfWork.GetRepository<Promotion>().Update(promotion);
            await _unitOfWork.SaveChangesAsync();
            return MapToPromotionDto(promotion);
        }

        // ─── SERVICES ─────────────────────────────────────────────────────────

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

            return new ServiceDto { Id = service.Id, Name = service.Name, Description = service.Description, Price = service.Price, Status = service.Status };
        }

        public async Task<bool> DeleteServiceAsync(Guid id)
        {
            var service = await _unitOfWork.GetRepository<Service>().GetByIdAsync(id);
            if (service == null) return false;

            _unitOfWork.GetRepository<Service>().Delete(service);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<ServiceDto> UpdateServiceAsync(Guid id, UpdateServiceRequest request)
        {
            var service = await _unitOfWork.GetRepository<Service>().GetByIdAsync(id);
            if (service == null) throw new Exception("Service not found");

            service.Name = request.Name;
            service.Description = request.Description;
            service.Price = request.Price;
            if (request.Status != null) service.Status = request.Status;

            _unitOfWork.GetRepository<Service>().Update(service);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceDto { Id = service.Id, Name = service.Name, Description = service.Description, Price = service.Price, Status = service.Status };
        }

        // ─── COMBO MANAGEMENT (Frame + Lens) ──────────────────────────────────

        public async Task<IEnumerable<ComboDto>> GetAllCombosAsync()
        {
            var combos = await _unitOfWork.GetRepository<Combo>().GetAllAsync();
            return combos.Select(MapToComboDto);
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
            return MapToComboDto(combo);
        }

        public async Task<ComboDto> UpdateComboAsync(Guid id, UpdateComboRequest request)
        {
            var combo = await _unitOfWork.GetRepository<Combo>().GetByIdAsync(id);
            if (combo == null) throw new Exception("Combo not found");

            combo.Name = request.Name;
            combo.Description = request.Description;
            combo.BasePrice = request.BasePrice;
            combo.StartDate = request.StartDate;
            combo.EndDate = request.EndDate;
            if (request.Status != null) combo.Status = request.Status;

            _unitOfWork.GetRepository<Combo>().Update(combo);
            await _unitOfWork.SaveChangesAsync();
            return MapToComboDto(combo);
        }

        public async Task<bool> DeleteComboAsync(Guid id)
        {
            var combo = await _unitOfWork.GetRepository<Combo>().GetByIdAsync(id);
            if (combo == null) return false;

            _unitOfWork.GetRepository<Combo>().Delete(combo);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── COMBO ITEM MANAGEMENT ────────────────────────────────────────────

        public async Task<IEnumerable<ComboItemDto>> GetComboItemsAsync(Guid comboId)
        {
            var items = await _unitOfWork.GetRepository<ComboItem>().FindAsync(ci => ci.ComboId == comboId);
            return items.Select(MapToComboItemDto);
        }

        public async Task<ComboItemDto> AddComboItemAsync(Guid comboId, AddComboItemRequest request)
        {
            var item = new ComboItem
            {
                Id = Guid.NewGuid(),
                ComboId = comboId,
                ProductVariantId = request.ProductVariantId,
                LensesVariantId = request.LensesVariantId,
                Quantity = request.Quantity
            };

            await _unitOfWork.GetRepository<ComboItem>().AddAsync(item);
            await _unitOfWork.SaveChangesAsync();
            return MapToComboItemDto(item);
        }

        public async Task<bool> RemoveComboItemAsync(Guid itemId)
        {
            var item = await _unitOfWork.GetRepository<ComboItem>().GetByIdAsync(itemId);
            if (item == null) return false;

            _unitOfWork.GetRepository<ComboItem>().Delete(item);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ─── MAPPERS ──────────────────────────────────────────────────────────

        private static PromotionDto MapToPromotionDto(Promotion p) => new PromotionDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Description = p.Description,
            DiscountValue = p.DiscountValue,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Status = p.Status
        };

        private static ComboDto MapToComboDto(Combo c) => new ComboDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            BasePrice = c.BasePrice,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            Status = c.Status,
            ComboItems = c.ComboItems?.Select(MapToComboItemDto).ToList() ?? new List<ComboItemDto>()
        };

        private static ComboItemDto MapToComboItemDto(ComboItem ci) => new ComboItemDto
        {
            Id = ci.Id,
            ComboId = ci.ComboId,
            ProductVariantId = ci.ProductVariantId,
            LensesVariantId = ci.LensesVariantId,
            Quantity = ci.Quantity
        };
    }
}
