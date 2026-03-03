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
    public class WarrantyPolicyService : IWarrantyPolicyService
    {
        private readonly IUnitOfWork _unitOfWork;

        public WarrantyPolicyService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<WarrantyPolicyDto>> GetAllWarrantyPoliciesAsync()
        {
            var policies = await _unitOfWork.GetRepository<WarrantyPolicy>().GetAllAsync();
            return policies.Select(p => new WarrantyPolicyDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                WarrantyPeriodMonth = p.WarrantyPeriodMonth,
                Conditions = p.Conditions,
                Status = p.Status
            });
        }

        public async Task<WarrantyPolicyDto?> GetWarrantyPolicyByIdAsync(Guid id)
        {
            var policy = await _unitOfWork.GetRepository<WarrantyPolicy>().GetByIdAsync(id);
            if (policy == null) return null;

            return new WarrantyPolicyDto
            {
                Id = policy.Id,
                Name = policy.Name,
                Description = policy.Description,
                WarrantyPeriodMonth = policy.WarrantyPeriodMonth,
                Conditions = policy.Conditions,
                Status = policy.Status
            };
        }

        public async Task<WarrantyPolicyDto> CreateWarrantyPolicyAsync(CreateWarrantyPolicyRequest request)
        {
            var policy = new WarrantyPolicy
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                WarrantyPeriodMonth = request.WarrantyPeriodMonth,
                Conditions = request.Conditions,
                Status = request.Status ?? "Active"
            };

            await _unitOfWork.GetRepository<WarrantyPolicy>().AddAsync(policy);
            await _unitOfWork.SaveChangesAsync();

            return new WarrantyPolicyDto
            {
                Id = policy.Id,
                Name = policy.Name,
                Description = policy.Description,
                WarrantyPeriodMonth = policy.WarrantyPeriodMonth,
                Conditions = policy.Conditions,
                Status = policy.Status
            };
        }

        public async Task<WarrantyPolicyDto> UpdateWarrantyPolicyAsync(Guid id, UpdateWarrantyPolicyRequest request)
        {
            var policy = await _unitOfWork.GetRepository<WarrantyPolicy>().GetByIdAsync(id);
            if (policy == null) throw new Exception("Warranty policy not found");

            policy.Name = request.Name;
            policy.Description = request.Description;
            policy.WarrantyPeriodMonth = request.WarrantyPeriodMonth;
            policy.Conditions = request.Conditions;
            if (request.Status != null)
                policy.Status = request.Status;

            _unitOfWork.GetRepository<WarrantyPolicy>().Update(policy);
            await _unitOfWork.SaveChangesAsync();

            return new WarrantyPolicyDto
            {
                Id = policy.Id,
                Name = policy.Name,
                Description = policy.Description,
                WarrantyPeriodMonth = policy.WarrantyPeriodMonth,
                Conditions = policy.Conditions,
                Status = policy.Status
            };
        }

        public async Task<bool> DeleteWarrantyPolicyAsync(Guid id)
        {
            var policy = await _unitOfWork.GetRepository<WarrantyPolicy>().GetByIdAsync(id);
            if (policy == null) return false;

            _unitOfWork.GetRepository<WarrantyPolicy>().Delete(policy);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
