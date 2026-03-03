using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IRevenueService
    {
        Task<RevenueOverviewDto> GetRevenueOverviewAsync();
        Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year);
        Task<IEnumerable<RecentOrderDto>> GetRecentOrdersAsync(int count = 5);
    }
}
