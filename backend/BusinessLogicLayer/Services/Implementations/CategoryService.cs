using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(ICategoryRepository categoryRepository, IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
            {
                throw new Exception("Dữ liệu đầu vào không được để trống");
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Status = "Active"
            };

            await _categoryRepository.AddAsync(category, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Status = category.Status
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return false;
            }

            _categoryRepository.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            if (!categories.Any())
            {
                throw new Exception("Không có danh mục sản phẩm nào.");
            }

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Status = c.Status
            }).ToList();
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                throw new Exception("Không có danh mục sản phẩm này.");
            }

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Status = category.Status
            };
        }

        public async Task<CategoryDto?> UpdateAsync(Guid id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                throw new Exception("Không có danh mục sản phẩm này.");
            }

            if (dto == null)
            {
                throw new Exception("Không được để trống.");
            }

            category.Name = dto.Name;
            category.Description = dto.Description;

            _categoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Status = category.Status
            };
        }
    }
}
