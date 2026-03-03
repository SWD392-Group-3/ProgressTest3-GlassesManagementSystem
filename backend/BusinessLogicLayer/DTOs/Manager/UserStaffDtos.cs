using System;

namespace BusinessLogicLayer.DTOs.Manager
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateUserRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "staff"; // admin, staff, customer_service
        public string? Status { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
    }

    /// <summary>Used by PATCH /users/{id}/status for Account Status Control (Lock/Unlock).</summary>
    public class SetAccountStatusRequest
    {
        /// <summary>Expected values: "Active" | "Locked"</summary>
        public string Status { get; set; } = "Active";
    }
}

