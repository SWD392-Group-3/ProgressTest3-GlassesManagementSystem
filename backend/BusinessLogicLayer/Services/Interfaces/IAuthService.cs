using BusinessLogicLayer.DTOs;

namespace BusinessLogicLayer.Services;

public interface IAuthService
{
    Task<(LoginResponse? Response, string? Error)> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<(LoginResponse? Response, string? Error)> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
}
