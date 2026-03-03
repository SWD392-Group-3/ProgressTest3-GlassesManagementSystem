namespace BusinessLogicLayer.DTOs.Manager
{
    public class CreateWarrantyPolicyRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int WarrantyPeriodMonth { get; set; }
        public string? Conditions { get; set; }
        public string? Status { get; set; }
    }
}
