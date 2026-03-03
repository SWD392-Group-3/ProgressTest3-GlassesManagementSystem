using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IWarrantyPolicyService
    {
        Task<IEnumerable<WarrantyPolicyDto>> GetAllWarrantyPoliciesAsync();
        Task<WarrantyPolicyDto?> GetWarrantyPolicyByIdAsync(Guid id);
        Task<WarrantyPolicyDto> CreateWarrantyPolicyAsync(CreateWarrantyPolicyRequest request);
        Task<WarrantyPolicyDto> UpdateWarrantyPolicyAsync(Guid id, UpdateWarrantyPolicyRequest request);
        Task<bool> DeleteWarrantyPolicyAsync(Guid id);
    }
}
