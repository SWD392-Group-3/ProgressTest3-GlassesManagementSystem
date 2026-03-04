using System;

namespace BusinessLogicLayer.DTOs.Manager
{
    public class UpdateWarrantyPolicyRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int WarrantyPeriodMonth { get; set; }
        public string? Conditions { get; set; }
        public string? Status { get; set; }
    }
}
