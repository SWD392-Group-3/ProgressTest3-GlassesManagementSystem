using BusinessLogicLayer.DTOs;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IReturnExchangeService
    {
        // Customer actions
        Task<(ReturnExchangeResponse? Response, string? Error)> CreateReturnExchangeAsync(
            CreateReturnExchangeRequest request,
            Guid customerId,
            CancellationToken cancellationToken = default
        );

        Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetCustomerReturnExchangesAsync(
            Guid customerId,
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
        Task<(ReturnExchangeResponse? Response, string? Error)> GetReturnExchangeByIdAsync(
            Guid returnExchangeId,
            CancellationToken cancellationToken = default
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
