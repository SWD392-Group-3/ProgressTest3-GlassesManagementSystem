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
}
