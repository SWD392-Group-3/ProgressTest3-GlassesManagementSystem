using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FeedbackService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<(bool Success, string? Error)> CreateFeedbackAsync(
            CreateFeedbackRequest request, 
            Guid customerUserId, 
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Validate customer
                var customer = (await _unitOfWork.GetRepository<Customer>()
                    .FindAsync(c => c.UserId == customerUserId, cancellationToken))
                    .FirstOrDefault();

                if (customer == null)
                    return (false, "Customer not found.");

                // Check rating
                if (request.Rating < 1 || request.Rating > 5)
                    return (false, "Rating must be between 1 and 5.");

                // Validate order item
                var orderItem = await _unitOfWork.GetRepository<OrderItem>()
                    .GetByIdAsync(request.OrderItemId, cancellationToken);
                
                if (orderItem == null)
                    return (false, "Order item not found.");
                    
                // Validate order item belongs to the requested product
                // Support both direct product items and variant-based items
                bool productMatches = orderItem.ProductId == request.ProductId;
                if (!productMatches && orderItem.ProductVariantId.HasValue)
                {
                    // Item was added via productVariantId — resolve its productId
                    var variant = await _unitOfWork.GetRepository<DataAccessLayer.Database.Entities.ProductVariant>()
                        .GetByIdAsync(orderItem.ProductVariantId.Value, cancellationToken);
                    productMatches = variant?.ProductId == request.ProductId;
                }
                if (!productMatches)
                {
                    return (false, "This item does not match the product.");
                }

                // Verify order belongs to customer & is Delivered/Completed
                var order = await _unitOfWork.GetRepository<Order>()
                    .GetByIdAsync(orderItem.OrderId, cancellationToken);

                if (order == null || order.CustomerId != customer.Id)
                    return (false, "Order does not belong to this customer.");

                if (order.Status != "Delivered" && order.Status != "Completed")
                    return (false, "You can only review products from delivered or completed orders.");

                // Check for duplicate feedback on this OrderItemId
                bool canFeedback = await CanCustomerFeedbackAsync(customerUserId, request.OrderItemId, cancellationToken);
                if (!canFeedback)
                    return (false, "You have already reviewed this item from this order.");

                // Create feedback
                var feedback = new Feedback
                {
                    Id = Guid.NewGuid(),
                    CustomerId = customer.Id,
                    ProductId = request.ProductId,
                    OrderItemId = request.OrderItemId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.GetRepository<Feedback>().AddAsync(feedback);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, $"Error creating feedback: {ex.Message}");
            }
        }

        public async Task<bool> CanCustomerFeedbackAsync(Guid customerUserId, Guid orderItemId, CancellationToken cancellationToken = default)
        {
            var customer = (await _unitOfWork.GetRepository<Customer>()
                .FindAsync(c => c.UserId == customerUserId, cancellationToken))
                .FirstOrDefault();

            if (customer == null) return false;

            // Check if there's any feedback for this specific order item by this customer
            var existingFeedbacks = await _unitOfWork.GetRepository<Feedback>()
                .FindAsync(f => f.OrderItemId == orderItemId && f.CustomerId == customer.Id, cancellationToken);

            return !existingFeedbacks.Any();
        }

        public async Task<ProductFeedbackSummaryResponse> GetProductFeedbacksAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            var feedbacks = await _unitOfWork.GetRepository<Feedback>()
                .FindAsync(f => f.ProductId == productId && f.Status == "Approved", cancellationToken);

            var feedbackList = feedbacks.ToList();
            if (!feedbackList.Any())
            {
                return new ProductFeedbackSummaryResponse
                {
                    AverageRating = 0,
                    TotalFeedbacks = 0,
                    Feedbacks = new List<FeedbackResponse>()
                };
            }

            var responseList = new List<FeedbackResponse>();
            
            // We need to fetch customer info manually since FindAsync may not eager load everything
            // Note: This could be optimized into a custom repo method, but keeping within existing pattern
            foreach (var f in feedbackList)
            {
                var customer = await _unitOfWork.GetRepository<Customer>().GetByIdAsync(f.CustomerId, cancellationToken);
                responseList.Add(new FeedbackResponse
                {
                    Id = f.Id,
                    ProductId = f.ProductId,
                    CustomerName = customer?.FullName ?? "Anonymous",
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreatedAt = f.CreatedAt
                });
            }

            return new ProductFeedbackSummaryResponse
            {
                TotalFeedbacks = responseList.Count,
                AverageRating = Math.Round(responseList.Average(r => r.Rating), 1),
                Feedbacks = responseList.OrderByDescending(f => f.CreatedAt).ToList()
            };
        }

        public async Task<IEnumerable<FeedbackResponse>> GetAllFeedbacksAsync(CancellationToken cancellationToken = default)
        {
            var feedbacks = await _unitOfWork.GetRepository<Feedback>().GetAllAsync(cancellationToken);
            var responseList = new List<FeedbackResponse>();

            foreach (var f in feedbacks)
            {
                var customer = await _unitOfWork.GetRepository<Customer>().GetByIdAsync(f.CustomerId, cancellationToken);
                responseList.Add(new FeedbackResponse
                {
                    Id = f.Id,
                    ProductId = f.ProductId,
                    CustomerName = customer?.FullName ?? "Anonymous",
                    Rating = f.Rating,
                    Comment = f.Comment,
                    Status = f.Status,
                    CreatedAt = f.CreatedAt
                });
            }

            return responseList.OrderByDescending(f => f.CreatedAt);
        }

        public async Task<(bool Success, string? Error)> ApproveFeedbackAsync(Guid feedbackId, CancellationToken cancellationToken = default)
        {
            var feedback = await _unitOfWork.GetRepository<Feedback>().GetByIdAsync(feedbackId, cancellationToken);
            if (feedback == null) return (false, "Feedback not found.");

            feedback.Status = "Approved";
            _unitOfWork.GetRepository<Feedback>().Update(feedback);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> RejectFeedbackAsync(Guid feedbackId, CancellationToken cancellationToken = default)
        {
            var feedback = await _unitOfWork.GetRepository<Feedback>().GetByIdAsync(feedbackId, cancellationToken);
            if (feedback == null) return (false, "Feedback not found.");

            feedback.Status = "Rejected";
            _unitOfWork.GetRepository<Feedback>().Update(feedback);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return (true, null);
        }
    }
}
