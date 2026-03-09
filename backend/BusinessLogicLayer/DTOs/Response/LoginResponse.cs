namespace BusinessLogicLayer.DTOs;

public record LoginResponse
{
    public string Token { get; init; } = "";
    public DateTime ExpiresAt { get; init; }
    public Guid UserId { get; init; }
    /// <summary>
    /// Customer.Id — chỉ có giá trị khi Role == "Customer", null với staff/admin.
    /// Dùng để client join nhóm SignalR nhận thông báo đơn hàng.
    /// </summary>
    public Guid? CustomerId { get; init; }
    public string Email { get; init; } = "";
    public string? FullName { get; init; }
    public string? Role { get; init; }
}
