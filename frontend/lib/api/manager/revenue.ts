import { apiRequest, API } from "../client";

export interface RevenueOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
}

export interface MonthlyRevenueItem {
  month: number;
  year: number;
  revenue: number;
}

export interface RecentOrderDto {
  id: string;
  customerName: string | null;
  finalAmount: number;
  status: string | null;
  orderDate: string;
}

/** Backend may return PascalCase; normalize to camelCase */
function toOverview(data: Record<string, unknown>): RevenueOverview {
  return {
    totalRevenue: Number((data.totalRevenue ?? data.TotalRevenue) ?? 0),
    totalOrders: Number((data.totalOrders ?? data.TotalOrders) ?? 0),
    totalCustomers: Number((data.totalCustomers ?? data.TotalCustomers) ?? 0),
    monthlyRevenue: Number((data.monthlyRevenue ?? data.MonthlyRevenue) ?? 0),
  };
}

function toMonthlyItem(d: Record<string, unknown>): MonthlyRevenueItem {
  return {
    month: Number(d.month ?? d.Month ?? 0),
    year: Number(d.year ?? d.Year ?? 0),
    revenue: Number(d.revenue ?? d.Revenue ?? 0),
  };
}

function toRecentOrder(d: Record<string, unknown>): RecentOrderDto {
  return {
    id: String(d.id ?? d.Id ?? ""),
    customerName: d.customerName != null ? String(d.customerName) : d.CustomerName != null ? String(d.CustomerName) : null,
    finalAmount: Number(d.finalAmount ?? d.FinalAmount ?? 0),
    status: d.status != null ? String(d.status) : d.Status != null ? String(d.Status) : null,
    orderDate: String(d.orderDate ?? d.OrderDate ?? ""),
  };
}

export async function getRevenueOverview(from?: string, to?: string): Promise<RevenueOverview> {
  const data = await apiRequest<Record<string, unknown>>(API.manager.revenue.overview(from, to), {}, { auth: true });
  return toOverview(data);
}

export async function getMonthlyRevenue(year: number): Promise<MonthlyRevenueItem[]> {
  const arr = await apiRequest<Record<string, unknown>[]>(API.manager.revenue.monthly(year), {}, { auth: true });
  return (Array.isArray(arr) ? arr : []).map(toMonthlyItem);
}

export async function getRecentOrders(count: number = 5): Promise<RecentOrderDto[]> {
  const arr = await apiRequest<Record<string, unknown>[]>(API.manager.revenue.recentOrders(count), {}, { auth: true });
  return (Array.isArray(arr) ? arr : []).map(toRecentOrder);
}
