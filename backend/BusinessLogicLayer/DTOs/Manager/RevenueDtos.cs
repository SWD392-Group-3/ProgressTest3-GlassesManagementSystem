using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Manager
{
    public class RevenueOverviewDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalCustomers { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RecentOrderDto
    {
        public Guid Id { get; set; }
        public string? CustomerName { get; set; }
        public decimal FinalAmount { get; set; }
        public string? Status { get; set; }
        public DateTime OrderDate { get; set; }
    }

    /// <summary>Payment Reconciliation — cross-check payments vs orders.</summary>
    public class PaymentReconciliationDto
    {
        public Guid PaymentId { get; set; }
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string? Method { get; set; }
        public string? Status { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? Note { get; set; }
    }

    /// <summary>Return/Exchange Impact Analysis — business regulation view for manager.</summary>
    public class ReturnExchangeImpactDto
    {
        public int TotalRequests { get; set; }
        public int PendingRequests { get; set; }
        public int ApprovedRequests { get; set; }
        public int RejectedRequests { get; set; }
        public int CompletedRequests { get; set; }
        /// <summary>Total refunded / financial impact amount (from completed returns).</summary>
        public decimal TotalFinancialImpact { get; set; }
        public List<TopReturnedProductDto> TopReturnedProducts { get; set; } = new();
    }

    public class TopReturnedProductDto
    {
        public string? ProductName { get; set; }
        public int ReturnCount { get; set; }
    }
}

