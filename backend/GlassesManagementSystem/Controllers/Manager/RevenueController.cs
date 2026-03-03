using System;
using System.Threading.Tasks;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GlassesManagementSystem.Controllers.Manager
{
    [Route("api/manager/revenue")]
    [ApiController]
    [Authorize(Roles = "admin,manager")]
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueService _revenueService;

        public RevenueController(IRevenueService revenueService)
        {
            _revenueService = revenueService;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var overview = await _revenueService.GetRevenueOverviewAsync();
            return Ok(overview);
        }

        [HttpGet("monthly/{year}")]
        public async Task<IActionResult> GetMonthlyRevenue(int year)
        {
            var monthly = await _revenueService.GetMonthlyRevenueAsync(year);
            return Ok(monthly);
        }

        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 5)
        {
            var orders = await _revenueService.GetRecentOrdersAsync(count);
            return Ok(orders);
        }

        // ─── PAYMENT RECONCILIATION (<<includes>> Revenue Monitoring) ─────────

        [HttpGet("payments")]
        public async Task<IActionResult> GetPaymentReconciliation(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var payments = await _revenueService.GetPaymentReconciliationAsync(from, to);
            return Ok(payments);
        }
    }
}
