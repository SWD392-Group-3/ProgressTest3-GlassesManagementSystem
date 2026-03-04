namespace BusinessLogicLayer.DTOs;

public record LoginResponse
{
    public string Token { get; init; } = "";
    public DateTime ExpiresAt { get; init; }
    public Guid UserId { get; init; }
    public string Email { get; init; } = "";
    public string? FullName { get; init; }
    public string? Role { get; init; }
}
