using BusinessLogicLayer.Constants;
using BusinessLogicLayer.DTOs;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services.Implementations
{
    public class ReturnExchangeService : IReturnExchangeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IReturnExchangeRepository _returnExchangeRepository;
        private readonly IReturnExchangeItemRepository _returnExchangeItemRepository;
        private readonly IReturnExchangeImageRepository _returnExchangeImageRepository;
        private readonly IReturnExchangeHistoryRepository _returnExchangeHistoryRepository;
        private readonly ICustomerRepository _customerRepository;

        public ReturnExchangeService(
            IUnitOfWork unitOfWork,
            IReturnExchangeRepository returnExchangeRepository,
            IReturnExchangeItemRepository returnExchangeItemRepository,
            IReturnExchangeImageRepository returnExchangeImageRepository,
            IReturnExchangeHistoryRepository returnExchangeHistoryRepository,
            ICustomerRepository customerRepository
        )
        {
            _unitOfWork = unitOfWork;
            _returnExchangeRepository = returnExchangeRepository;
            _returnExchangeItemRepository = returnExchangeItemRepository;
            _returnExchangeImageRepository = returnExchangeImageRepository;
            _returnExchangeHistoryRepository = returnExchangeHistoryRepository;
            _customerRepository = customerRepository;
        }

        public async Task<(
            ReturnExchangeResponse? Response,
            string? Error
        )> CreateReturnExchangeAsync(
            CreateReturnExchangeRequest request,
            Guid userId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var customer = await _customerRepository.GetByUserIdAsync(userId);
                if (customer == null)
                    return (null, "Account not found.");

                // Validate order exists and belongs to customer
                var orderRepo = _unitOfWork.GetRepository<Order>();
                var order = await orderRepo.GetByIdAsync(request.OrderId, cancellationToken);

                if (order == null)
                    return (null, "Order not found.");

                if (order.CustomerId != customer.Id)
                    return (null, "This order does not belong to this customer.");

                // Chỉ được hoàn hàng khi đơn đã giao
                if (order.Status != "Delivered")
                    return (null, "Return is only allowed when the order has been delivered.");

                // Đơn dịch vụ (không giao hàng) không hỗ trợ đổi trả
                if (string.IsNullOrEmpty(order.ShippingAddress) && string.IsNullOrEmpty(order.ShippingPhone))
                    return (null, "Service orders do not support return or exchange requests.");

                // Lấy tất cả OrderItem thuộc order này để validate
                var orderItemRepo = _unitOfWork.GetRepository<OrderItem>();
                var orderItems = await orderItemRepo.FindAsync(
                    oi => oi.OrderId == request.OrderId,
                    cancellationToken
                );
                var orderItemDict = orderItems.ToDictionary(oi => oi.Id);

                // Validate từng item trong request
                foreach (var item in request.Items)
                {
                    if (!orderItemDict.TryGetValue(item.OrderItemId, out var orderItem))
                        return (null, $"Item {item.OrderItemId} does not belong to this order.");

                    if (item.Quantity <= 0)
                        return (null, "Return quantity must be greater than 0.");

                    if (item.Quantity > orderItem.Quantity)
                        return (
                            null,
                            $"Return quantity ({item.Quantity}) exceeds purchased quantity ({orderItem.Quantity})."
                        );

                    // Kiểm tra OrderItem này đã có trong yêu cầu hoàn hàng Pending/ApprovedBySales chưa
                    var existingItems = await _returnExchangeItemRepository.GetByOrderItemIdAsync(
                        item.OrderItemId
                    );
                    var activeReturn = existingItems.FirstOrDefault(ri =>
                        ri.ReturnExchange != null
                        && ri.ReturnExchange.Status != "Rejected"
                        && ri.ReturnExchange.Status != "Completed"
                    );
                    if (activeReturn != null)
                        return (
                            null,
                            $"Item {item.OrderItemId} has a pending return request that has not been processed."
                        );
                }

                // Create return exchange
                var returnExchange = new ReturnExchange
                {
                    Id = Guid.NewGuid(),
                    OrderId = request.OrderId,
                    CustomerId = customer.Id,
                    Reason = request.Reason,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                };

                await _returnExchangeRepository.AddAsync(returnExchange, cancellationToken);

                // Create return exchange items with images
                foreach (var item in request.Items)
                {
                    var returnItem = new ReturnExchangeItem
                    {
                        Id = Guid.NewGuid(),
                        ReturnExchangeId = returnExchange.Id,
                        OrderItemId = item.OrderItemId,
                        Quantity = item.Quantity,
                        Reason = item.Reason,
                        Status = "Pending",
                        CreatedAt = DateTime.UtcNow,
                    };

                    await _returnExchangeItemRepository.AddAsync(returnItem, cancellationToken);

                    // Add customer images
                    if (item.ImageUrls != null && item.ImageUrls.Any())
                    {
                        // Validate max 5 images
                        if (item.ImageUrls.Count > 5)
                            return (null, "Tối đa 5 hình ảnh cho mỗi sản phẩm");

                        foreach (var imageUrl in item.ImageUrls)
                        {
                            var image = new ReturnExchangeImage
                            {
                                Id = Guid.NewGuid(),
                                ReturnExchangeItemId = returnItem.Id,
                                ImageUrl = imageUrl,
                                UploadedByRole = "Customer",
                                UploadedByUserId = userId,
                                UploadedAt = DateTime.UtcNow,
                            };

                            await _returnExchangeImageRepository.AddAsync(image, cancellationToken);
                        }
                    }
                }

                // Create history
                var history = new ReturnExchangeHistory
                {
                    Id = Guid.NewGuid(),
                    ReturnExchangeId = returnExchange.Id,
                    Action = "Created",
                    NewStatus = "Pending",
                    Comment = "Return request created by customer",
                    PerformedByUserId = userId,
                    PerformedByRole = "Customer",
                    PerformedAt = DateTime.UtcNow,
                };

                await _returnExchangeHistoryRepository.AddAsync(history, cancellationToken);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return await GetReturnExchangeByIdAsync(returnExchange.Id, cancellationToken);
            }
            catch (Exception ex)
            {
                return (null, $"Error creating return request: {ex.Message}");
            }
        }

        public async Task<(
            ReturnExchangeResponse? Response,
            string? Error
        )> ReviewReturnExchangeAsync(
            ReviewReturnExchangeRequest request,
            Guid salesUserId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var returnExchange = await _returnExchangeRepository.GetByIdAsync(
                    request.ReturnExchangeId,
                    cancellationToken
                );

                if (returnExchange == null)
                    return (null, "Return request not found.");

                if (returnExchange.Status != "Pending")
                    return (null, "Return request has already been processed.");

                var oldStatus = returnExchange.Status;

                if (request.IsApproved)
                {
                    returnExchange.Status = "ApprovedBySales";
                    returnExchange.ReviewedBySalesAt = DateTime.UtcNow;
                }
                else
                {
                    returnExchange.Status = "Rejected";
                    returnExchange.RejectionReason = request.RejectionReason;
                    returnExchange.ResolvedAt = DateTime.UtcNow;
                }

                _returnExchangeRepository.Update(returnExchange);

                // Add images if provided
                if (request.Images != null && request.Images.Any())
                {
                    foreach (var imageRequest in request.Images)
                    {
                        var existingCount =
                            await _returnExchangeImageRepository.CountImagesByItemAndRoleAsync(
                                imageRequest.ReturnExchangeItemId,
                                "Sales"
                            );

                        if (existingCount + imageRequest.ImageUrls.Count > 5)
                            return (null, "Tối đa 5 hình ảnh cho mỗi vai trò");

                        foreach (var imageUrl in imageRequest.ImageUrls)
                        {
                            var image = new ReturnExchangeImage
                            {
                                Id = Guid.NewGuid(),
                                ReturnExchangeItemId = imageRequest.ReturnExchangeItemId,
                                ImageUrl = imageUrl,
                                UploadedByRole = "Sales",
                                UploadedByUserId = salesUserId,
                                UploadedAt = DateTime.UtcNow,
                                Description = imageRequest.Description,
                            };

                            await _returnExchangeImageRepository.AddAsync(image, cancellationToken);
                        }
                    }
                }

                // Create history
                var history = new ReturnExchangeHistory
                {
                    Id = Guid.NewGuid(),
                    ReturnExchangeId = returnExchange.Id,
                    Action = request.IsApproved ? "ApprovedBySales" : "RejectedBySales",
                    OldStatus = oldStatus,
                    NewStatus = returnExchange.Status,
                    Comment = request.Comment,
                    PerformedByUserId = salesUserId,
                    PerformedByRole = "Sales",
                    PerformedAt = DateTime.UtcNow,
                };

                await _returnExchangeHistoryRepository.AddAsync(history, cancellationToken);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return await GetReturnExchangeByIdAsync(returnExchange.Id, cancellationToken);
            }
            catch (Exception ex)
            {
                return (null, $"Error reviewing return request: {ex.Message}");
            }
        }

        public async Task<(
            ReturnExchangeResponse? Response,
            string? Error
        )> ReceiveReturnExchangeAsync(
            ReceiveReturnExchangeRequest request,
            Guid operationUserId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var returnExchange = await _returnExchangeRepository.GetByIdAsync(
                    request.ReturnExchangeId,
                    cancellationToken
                );

                if (returnExchange == null)
                    return (null, "Return request not found.");

                if (returnExchange.Status != "ApprovedBySales")
                    return (null, "Return request has not been approved by staff yet.");

                var order = await _unitOfWork.GetRepository<Order>().GetByIdAsync(
                    returnExchange.OrderId,
                    cancellationToken
                );
                if (order == null)
                    return (null, "Order not found.");

                var oldStatus = returnExchange.Status;
                returnExchange.Status = "ReceivedByOperation";
                returnExchange.ReceivedByOperationAt = DateTime.UtcNow;

                _returnExchangeRepository.Update(returnExchange);

                // Update items, InspectionResult, ProductVariant/Prescription, and add images
                foreach (var item in request.Items)
                {
                    if (!string.IsNullOrWhiteSpace(item.InspectionResult)
                        && !InspectionResult.All.Contains(item.InspectionResult))
                        return (null, $"Kết quả kiểm tra không hợp lệ. Cho phép: {string.Join(", ", InspectionResult.All)}");

                    var returnItem = await _returnExchangeItemRepository.GetByIdWithOrderItemDetailsAsync(
                        item.ReturnExchangeItemId,
                        cancellationToken
                    );

                    if (returnItem == null)
                        continue;

                    returnItem.Status = item.Status;
                    returnItem.Note = item.Note;
                    returnItem.InspectionResult = item.InspectionResult;

                    _returnExchangeItemRepository.Update(returnItem);

                    // Cập nhật ProductVariant khi item là sản phẩm thường
                    if (!string.IsNullOrWhiteSpace(item.InspectionResult)
                        && returnItem.OrderItem?.ProductVariantId != null
                        && returnItem.OrderItem.ProductVariant != null)
                    {
                        var pv = returnItem.OrderItem.ProductVariant;
                        pv.Status = item.InspectionResult;
                        _unitOfWork.GetRepository<ProductVariant>().Update(pv);
                    }

                    // Cập nhật Prescription khi item là kính custom (tra theo CustomerId + ServiceId)
                    if (!string.IsNullOrWhiteSpace(item.InspectionResult)
                        && returnItem.OrderItem?.ServiceId != null)
                    {
                        var prescription = await _unitOfWork
                            .GetRepository<Prescription>()
                            .FirstOrDefaultAsync(
                                p =>
                                    p.CustomerId == order.CustomerId
                                    && p.ServiceId == returnItem.OrderItem.ServiceId,
                                cancellationToken
                            );
                        if (prescription != null)
                        {
                            prescription.Status = item.InspectionResult;
                            prescription.UpdatedAt = DateTime.UtcNow;
                            _unitOfWork.GetRepository<Prescription>().Update(prescription);
                        }
                    }

                    // Add operation images
                    if (item.ImageUrls != null && item.ImageUrls.Any())
                    {
                        var existingCount =
                            await _returnExchangeImageRepository.CountImagesByItemAndRoleAsync(
                                item.ReturnExchangeItemId,
                                "Operation"
                            );

                        if (existingCount + item.ImageUrls.Count > 5)
                            return (null, "Tối đa 5 hình ảnh cho mỗi vai trò");

                        foreach (var imageUrl in item.ImageUrls)
                        {
                            var image = new ReturnExchangeImage
                            {
                                Id = Guid.NewGuid(),
                                ReturnExchangeItemId = item.ReturnExchangeItemId,
                                ImageUrl = imageUrl,
                                UploadedByRole = "Operation",
                                UploadedByUserId = operationUserId,
                                UploadedAt = DateTime.UtcNow,
                            };

                            await _returnExchangeImageRepository.AddAsync(image, cancellationToken);
                        }
                    }
                }

                // Create history
                var history = new ReturnExchangeHistory
                {
                    Id = Guid.NewGuid(),
                    ReturnExchangeId = returnExchange.Id,
                    Action = "ReceivedByOperation",
                    OldStatus = oldStatus,
                    NewStatus = returnExchange.Status,
                    Comment = request.Comment,
                    PerformedByUserId = operationUserId,
                    PerformedByRole = "Operation",
                    PerformedAt = DateTime.UtcNow,
                };

                await _returnExchangeHistoryRepository.AddAsync(history, cancellationToken);

                // Nếu tất cả items đã được xử lý (Received hoặc Rejected), cập nhật status Completed
                var allItems = await _returnExchangeItemRepository.GetByReturnExchangeIdAsync(
                    returnExchange.Id
                );
                var allProcessed = allItems.All(i =>
                    i.Status == "Received" || i.Status == "Rejected"
                );
                if (allProcessed && allItems.Any())
                {
                    var prevStatus = returnExchange.Status;
                    returnExchange.Status = "Completed";
                    returnExchange.ResolvedAt = DateTime.UtcNow;
                    _returnExchangeRepository.Update(returnExchange);

                    var completedHistory = new ReturnExchangeHistory
                    {
                        Id = Guid.NewGuid(),
                        ReturnExchangeId = returnExchange.Id,
                        Action = "Completed",
                        OldStatus = prevStatus,
                        NewStatus = "Completed",
                        Comment = "All items processed, return request completed",
                        PerformedByUserId = operationUserId,
                        PerformedByRole = "Operation",
                        PerformedAt = DateTime.UtcNow,
                    };
                    await _returnExchangeHistoryRepository.AddAsync(
                        completedHistory,
                        cancellationToken
                    );
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return await GetReturnExchangeByIdAsync(returnExchange.Id, cancellationToken);
            }
            catch (Exception ex)
            {
                return (null, $"Lỗi khi nhận hàng hoàn: {ex.Message}");
            }
        }

        public async Task<(
            ReturnExchangeResponse? Response,
            string? Error
        )> GetReturnExchangeByIdAsync(
            Guid returnExchangeId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var returnExchange = await _returnExchangeRepository.GetByIdAsync(
                    returnExchangeId,
                    cancellationToken
                );

                if (returnExchange == null)
                    return (null, "Return request not found.");

                var items = await _returnExchangeItemRepository.GetByReturnExchangeIdAsync(
                    returnExchangeId
                );
                var histories = await _returnExchangeHistoryRepository.GetByReturnExchangeIdAsync(
                    returnExchangeId
                );

                var response = new ReturnExchangeResponse
                {
                    Id = returnExchange.Id,
                    OrderId = returnExchange.OrderId,
                    CustomerId = returnExchange.CustomerId,
                    Reason = returnExchange.Reason,
                    Status = returnExchange.Status,
                    RejectionReason = returnExchange.RejectionReason,
                    CreatedAt = returnExchange.CreatedAt,
                    ReviewedBySalesAt = returnExchange.ReviewedBySalesAt,
                    ReceivedByOperationAt = returnExchange.ReceivedByOperationAt,
                    ResolvedAt = returnExchange.ResolvedAt,
                    Items = items
                        .Select(i => new ReturnExchangeItemResponse
                        {
                            Id = i.Id,
                            OrderItemId = i.OrderItemId,
                            Quantity = i.Quantity,
                            Reason = i.Reason,
                            Status = i.Status,
                            Note = i.Note,
                            InspectionResult = i.InspectionResult,
                            CreatedAt = i.CreatedAt,
                            Images = (i.Images ?? Enumerable.Empty<ReturnExchangeImage>())
                                .Select(img => new ReturnExchangeImageResponse
                                {
                                    Id = img.Id,
                                    ImageUrl = img.ImageUrl,
                                    UploadedByRole = img.UploadedByRole,
                                    UploadedByUserId = img.UploadedByUserId,
                                    UploadedAt = img.UploadedAt,
                                    Description = img.Description,
                                })
                                .ToList(),
                        })
                        .ToList(),
                    Histories = histories
                        .Select(h => new ReturnExchangeHistoryResponse
                        {
                            Id = h.Id,
                            Action = h.Action,
                            OldStatus = h.OldStatus,
                            NewStatus = h.NewStatus,
                            Comment = h.Comment,
                            PerformedByUserId = h.PerformedByUserId,
                            PerformedByRole = h.PerformedByRole,
                            PerformedAt = h.PerformedAt,
                        })
                        .ToList(),
                };

                return (response, null);
            }
            catch (Exception ex)
            {
                return (null, $"Error getting return request: {ex.Message}");
            }
        }

        public async Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetCustomerReturnExchangesAsync(
            Guid userId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var customer = await _customerRepository.GetByUserIdAsync(userId);
                if (customer == null)
                    return (null, "Account not found.");

                var returnExchanges = await _returnExchangeRepository.FindAsync(
                    r => r.CustomerId == customer.Id,
                    cancellationToken
                );

                var responses = new List<ReturnExchangeResponse>();

                foreach (var re in returnExchanges)
                {
                    var result = await GetReturnExchangeByIdAsync(re.Id, cancellationToken);
                    if (result.Response != null)
                        responses.Add(result.Response);
                }

                return (responses, null);
            }
            catch (Exception ex)
            {
                return (null, $"Error getting return list: {ex.Message}");
            }
        }

        public async Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetPendingReturnExchangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var returnExchanges = await _returnExchangeRepository.FindAsync(
                    r => r.Status == "Pending",
                    cancellationToken
                );

                var responses = new List<ReturnExchangeResponse>();

                foreach (var re in returnExchanges)
                {
                    var result = await GetReturnExchangeByIdAsync(re.Id, cancellationToken);
                    if (result.Response != null)
                        responses.Add(result.Response);
                }

                return (responses, null);
            }
            catch (Exception ex)
            {
                return (null, $"Error getting pending return list: {ex.Message}");
            }
        }

        public async Task<(
            IEnumerable<ReturnExchangeResponse>? Response,
            string? Error
        )> GetApprovedReturnExchangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var returnExchanges = await _returnExchangeRepository.FindAsync(
                    r => r.Status == "ApprovedBySales",
                    cancellationToken
                );

                var responses = new List<ReturnExchangeResponse>();

                foreach (var re in returnExchanges)
                {
                    var result = await GetReturnExchangeByIdAsync(re.Id, cancellationToken);
                    if (result.Response != null)
                        responses.Add(result.Response);
                }

                return (responses, null);
            }
            catch (Exception ex)
            {
                return (
                    null,
                    $"Error getting approved return list: {ex.Message}"
                );
            }
        }

        public async Task<(bool Success, string? Error)> AddImagesAsync(
            Guid returnExchangeItemId,
            List<string> imageUrls,
            string role,
            Guid userId,
            string? description = null,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var existingCount =
                    await _returnExchangeImageRepository.CountImagesByItemAndRoleAsync(
                        returnExchangeItemId,
                        role
                    );

                if (existingCount + imageUrls.Count > 5)
                    return (false, "Tối đa 5 hình ảnh cho mỗi vai trò");

                foreach (var imageUrl in imageUrls)
                {
                    var image = new ReturnExchangeImage
                    {
                        Id = Guid.NewGuid(),
                        ReturnExchangeItemId = returnExchangeItemId,
                        ImageUrl = imageUrl,
                        UploadedByRole = role,
                        UploadedByUserId = userId,
                        UploadedAt = DateTime.UtcNow,
                        Description = description,
                    };

                    await _returnExchangeImageRepository.AddAsync(image, cancellationToken);
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi khi thêm hình ảnh: {ex.Message}");
            }
        }
    }
}
