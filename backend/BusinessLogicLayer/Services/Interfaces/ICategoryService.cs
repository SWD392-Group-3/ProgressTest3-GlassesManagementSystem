using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(Guid id);
        Task<CategoryDto> CreateAsync(
            CreateCategoryDto dto,
            CancellationToken cancellationToken = default
        );
        Task<CategoryDto?> UpdateAsync(
            Guid id,
            UpdateCategoryDto dto,
            CancellationToken cancellationToken = default
        );
        Task<bool> DeleteAsync(Guid id);
    }
}
