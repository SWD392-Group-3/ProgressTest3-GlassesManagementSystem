namespace BusinessLogicLayer.DTOs;

public record RegisterRequest
{
    public string Email { get; init; } = "";
    public string Password { get; init; } = "";
    public string? FullName { get; init; }
    public string? Phone { get; init; }
}
