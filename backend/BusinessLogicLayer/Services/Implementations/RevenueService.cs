using System;
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
    }
}
