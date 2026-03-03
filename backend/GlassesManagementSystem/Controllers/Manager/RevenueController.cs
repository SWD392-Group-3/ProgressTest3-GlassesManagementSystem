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

        /// <summary>
        /// Revenue Monitoring — UC: "Select time range/filters. System aggregates from orders."
        /// </summary>
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var overview = await _revenueService.GetRevenueOverviewAsync(from, to);
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

        // ─── RETURN/EXCHANGE IMPACT ANALYSIS (<<includes>> Business Regulation Mgmt) ──

        /// <summary>
        /// Return/Exchange Impact Analysis — UC: "Filter return requests by time range.
        /// Aggregate by status. Link to order to estimate revenue impact."
        /// </summary>
        [HttpGet("return-exchange-impact")]
        public async Task<IActionResult> GetReturnExchangeImpact(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var impact = await _revenueService.GetReturnExchangeImpactAsync(from, to);
            return Ok(impact);
        }
    }
}
