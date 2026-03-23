using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IFeedbackService
    {
        Task<(bool Success, string? Error)> CreateFeedbackAsync(CreateFeedbackRequest request, Guid customerUserId, CancellationToken cancellationToken = default);
        Task<ProductFeedbackSummaryResponse> GetProductFeedbacksAsync(Guid productId, CancellationToken cancellationToken = default);
        Task<bool> CanCustomerFeedbackAsync(Guid customerUserId, Guid orderItemId, CancellationToken cancellationToken = default);
        
        // Manager methods
        Task<IEnumerable<FeedbackResponse>> GetAllFeedbacksAsync(CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> ApproveFeedbackAsync(Guid feedbackId, CancellationToken cancellationToken = default);
        Task<(bool Success, string? Error)> RejectFeedbackAsync(Guid feedbackId, CancellationToken cancellationToken = default);
    }
}
