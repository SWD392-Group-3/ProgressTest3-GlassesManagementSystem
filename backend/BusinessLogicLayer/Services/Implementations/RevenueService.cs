using System;
using DataAccessLayer.Database.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implementations
{
    public class RevenueService : IRevenueService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RevenueService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<RevenueOverviewDto> GetRevenueOverviewAsync()
        {
            var orders = await _unitOfWork.GetRepository<Order>().GetAllAsync();
            var customers = await _unitOfWork.GetRepository<Customer>().GetAllAsync();

            var currentMonthOrders = orders.Where(o => o.OrderDate.Month == DateTime.UtcNow.Month && o.OrderDate.Year == DateTime.UtcNow.Year);

            return new RevenueOverviewDto
            {
                TotalRevenue = orders.Where(o => o.Status == "Completed" || o.Status == "Paid").Sum(o => o.TotalAmount),
                TotalOrders = orders.Count(),
                TotalCustomers = customers.Count(),
                MonthlyRevenue = currentMonthOrders.Where(o => o.Status == "Completed" || o.Status == "Paid").Sum(o => o.TotalAmount)
            };
        }

        public async Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year)
        {
            var orders = await _unitOfWork.GetRepository<Order>()
                .FindAsync(o => o.OrderDate.Year == year && (o.Status == "Completed" || o.Status == "Paid"));

            var monthlyRevenues = orders
                .GroupBy(o => o.OrderDate.Month)
                .Select(g => new MonthlyRevenueDto
                {
                    Month = g.Key,
                    Year = year,
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(m => m.Month)
                .ToList();

            // Fill missing months with 0
            var result = new List<MonthlyRevenueDto>();
            for (int i = 1; i <= 12; i++)
            {
                var monthData = monthlyRevenues.FirstOrDefault(m => m.Month == i);
                if (monthData != null)
                {
                    result.Add(monthData);
                }
                else
                {
                    result.Add(new MonthlyRevenueDto { Month = i, Year = year, Revenue = 0 });
                }
            }

            return result;
        }

        public async Task<IEnumerable<RecentOrderDto>> GetRecentOrdersAsync(int count = 5)
        {
            var orders = await _unitOfWork.GetRepository<Order>().GetAllAsync();

            return orders
                .OrderByDescending(o => o.OrderDate)
                .Take(count)
                .Select(o => new RecentOrderDto
                {
                    Id = o.Id,
                    CustomerName = o.Customer?.FullName ?? "Unknown",
                    FinalAmount = o.TotalAmount,
                    Status = o.Status,
                    OrderDate = o.OrderDate
                });
        }

        public async Task<IEnumerable<PaymentReconciliationDto>> GetPaymentReconciliationAsync(DateTime? from, DateTime? to)
        {
            var payments = await _unitOfWork.GetRepository<Payment>().GetAllAsync();

            var filtered = payments.AsQueryable();
            if (from.HasValue) filtered = filtered.Where(p => p.PaidAt >= from.Value);
            if (to.HasValue)   filtered = filtered.Where(p => p.PaidAt <= to.Value);

            return filtered.Select(p => new PaymentReconciliationDto
            {
                PaymentId = p.Id,
                OrderId   = p.OrderId,
                Amount    = p.Amount,
                Method    = p.Method,
                Status    = p.Status,
                PaidAt    = p.PaidAt,
                Note      = p.Note
            }).ToList();
        }

        public async Task<ReturnExchangeImpactDto> GetReturnExchangeImpactAsync()
        {
            var allRe = await _unitOfWork.GetRepository<ReturnExchange>().GetAllAsync();
            var list  = allRe.ToList();

            // Financial impact = sum of order TotalAmount for Completed returns
            var completedOrders = list
                .Where(r => r.Status == "Completed")
                .Select(r => r.Order)
                .Where(o => o != null)
                .ToList();

            var financialImpact = completedOrders.Sum(o => o?.TotalAmount ?? 0);

            // Top returned products: aggregate through ReturnExchangeItems → OrderItem → Product
            var topProducts = list
                .SelectMany(r => r.ReturnExchangeItems)
                .GroupBy(ri => ri.OrderItem?.Order?.Id) // group by order for now
                .Select(g => new TopReturnedProductDto
                {
                    ProductName = g.FirstOrDefault()?.OrderItem?.ProductVariantId.ToString() ?? "Unknown",
                    ReturnCount = g.Count()
                })
                .OrderByDescending(x => x.ReturnCount)
                .Take(5)
                .ToList();

            return new ReturnExchangeImpactDto
            {
                TotalRequests     = list.Count,
                PendingRequests   = list.Count(r => r.Status == "Pending"),
                ApprovedRequests  = list.Count(r => r.Status == "ApprovedBySales"),
                RejectedRequests  = list.Count(r => r.Status == "Rejected"),
                CompletedRequests = list.Count(r => r.Status == "Completed"),
                TotalFinancialImpact = financialImpact,
                TopReturnedProducts  = topProducts
            };
        }
    }
}
