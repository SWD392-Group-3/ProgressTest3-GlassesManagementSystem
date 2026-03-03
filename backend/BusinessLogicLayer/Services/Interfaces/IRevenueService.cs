using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IRevenueService
    {
        // Revenue Monitoring
        Task<RevenueOverviewDto> GetRevenueOverviewAsync();
        Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year);
        Task<IEnumerable<RecentOrderDto>> GetRecentOrdersAsync(int count = 5);

        // Payment Reconciliation (<<includes>> Revenue Monitoring)
        Task<IEnumerable<PaymentReconciliationDto>> GetPaymentReconciliationAsync(DateTime? from, DateTime? to);

        // Return/Exchange Impact Analysis (<<includes>> Business Regulation Management)
        Task<ReturnExchangeImpactDto> GetReturnExchangeImpactAsync();
    }
}
