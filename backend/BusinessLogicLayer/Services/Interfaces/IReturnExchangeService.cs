using BusinessLogicLayer.DTOs;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IReturnExchangeService
    {
        // Customer actions
        Task<(ReturnExchangeResponse? Response, string? Error)> CreateReturnExchangeAsync(
            CreateReturnExchangeRequest request,
            Guid userId,
            CancellationToken cancellationToken = default
        );

        Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetCustomerReturnExchangesAsync(
            Guid userId,
            CancellationToken cancellationToken = default
        );

        // Sales actions
        Task<(ReturnExchangeResponse? Response, string? Error)> ReviewReturnExchangeAsync(
            ReviewReturnExchangeRequest request,
            Guid salesUserId,
            CancellationToken cancellationToken = default
        );

        Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetPendingReturnExchangesAsync(CancellationToken cancellationToken = default);

        // Operation actions
        Task<(ReturnExchangeResponse? Response, string? Error)> ReceiveReturnExchangeAsync(
            ReceiveReturnExchangeRequest request,
            Guid operationUserId,
            CancellationToken cancellationToken = default
        );

        Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetApprovedReturnExchangesAsync(CancellationToken cancellationToken = default);

        // Common actions
        /// <param name="customerUserIdMustOwnRequest">
        /// Nếu có (JWT của Customer), chỉ trả về khi đơn thuộc khách đó; không khớp → lỗi như không tìm thấy.
        /// </param>
        Task<(ReturnExchangeResponse? Response, string? Error)> GetReturnExchangeByIdAsync(
            Guid returnExchangeId,
            CancellationToken cancellationToken = default,
            Guid? customerUserIdMustOwnRequest = null
        );

        Task<(bool Success, string? Error)> AddImagesAsync(
            Guid returnExchangeItemId,
            List<string> imageUrls,
            string role,
            Guid userId,
            string? description = null,
            CancellationToken cancellationToken = default
        );
    }
}
