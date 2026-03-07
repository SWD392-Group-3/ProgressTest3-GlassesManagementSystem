using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class ComboService : IComboService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ComboService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ─── PUBLIC METHODS ───────────────────────────────────────────────────

        public async Task<IEnumerable<ComboDto>> GetAllCombosAsync()
        {
            var combos = await _unitOfWork.GetRepository<Combo>().GetAllAsync();
            var result = new List<ComboDto>();
            foreach (var combo in combos)
                result.Add(await BuildComboDtoAsync(combo));
            return result;
        }

        public async Task<ComboDto?> GetComboByIdAsync(Guid id)
        {
            var combo = await _unitOfWork.GetRepository<Combo>().GetByIdAsync(id);
            if (combo == null) return null;
            return await BuildComboDtoAsync(combo);
        }

        // ─── PRIVATE HELPERS ──────────────────────────────────────────────────

        private async Task<ComboDto> BuildComboDtoAsync(Combo combo)
        {
            // Lấy tất cả ComboItem thuộc combo này
            var rawItems = await _unitOfWork.GetRepository<ComboItem>()
                .FindAsync(ci => ci.ComboId == combo.Id);

            var itemDtos = new List<ComboItemDto>();

            foreach (var item in rawItems)
            {
                var itemDto = new ComboItemDto
                {
                    Id = item.Id,
                    ComboId = item.ComboId,
                    ProductVariantId = item.ProductVariantId,
                    LensesVariantId = item.LensesVariantId,
                    Quantity = item.Quantity
                };

                // ── Gọng kính (ProductVariant) ──────────────────────────────
                if (item.ProductVariantId.HasValue)
                {
                    var variant = await _unitOfWork.GetRepository<ProductVariant>()
                        .GetByIdAsync(item.ProductVariantId.Value);

                    if (variant != null)
                    {
                        var product = await _unitOfWork.GetRepository<Product>()
                            .GetByIdAsync(variant.ProductId);

                        itemDto.FrameVariant = new ComboFrameVariantDto
                        {
                            Id          = variant.Id,
                            ProductId   = variant.ProductId,
                            ProductName = product?.Name,
                            UnitPrice   = product?.UnitPrice,
                            ProductImageUrl = product?.ImageUrl,
                            Color    = variant.Color,
                            Size     = variant.Size,
                            Material = variant.Material,
                            Price    = variant.Price,
                            Status   = variant.Status,
                            ImageUrl = variant.ImageUrl
                        };
                    }
                }

                // ── Tròng kính (LensVariant) ─────────────────────────────────
                if (item.LensesVariantId.HasValue)
                {
                    var lens = await _unitOfWork.GetRepository<LensVariant>()
                        .GetByIdAsync(item.LensesVariantId.Value);

                    if (lens != null)
                    {
                        var product = await _unitOfWork.GetRepository<Product>()
                            .GetByIdAsync(lens.ProductId);

                        itemDto.LensVariant = new ComboLensVariantDto
                        {
                            Id          = lens.Id,
                            ProductId   = lens.ProductId,
                            ProductName = product?.Name,
                            UnitPrice   = product?.UnitPrice,
                            ProductImageUrl = product?.ImageUrl,
                            DoCau       = lens.DoCau,
                            DoTru       = lens.DoTru,
                            ChiSoKhucXa = lens.ChiSoKhucXa,
                            Price    = lens.Price,
                            Status   = lens.Status,
                            ImageUrl = lens.ImageUrl
                        };
                    }
                }

                itemDtos.Add(itemDto);
            }

            return new ComboDto
            {
                Id          = combo.Id,
                Name        = combo.Name,
                Description = combo.Description,
                BasePrice   = combo.BasePrice,
                StartDate   = combo.StartDate,
                EndDate     = combo.EndDate,
                Status      = combo.Status,
                ComboItems  = itemDtos
            };
        }
    }
}
