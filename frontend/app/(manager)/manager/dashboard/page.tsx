"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    getRevenueOverview,
    getMonthlyRevenue,
    getRecentOrders,
    type RevenueOverview as RevenueOverviewType,
    type RecentOrderDto,
    type MonthlyRevenueItem,
} from "@/lib/api/manager/revenue";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ManagerDashboard() {
    const [overview, setOverview] = useState<RevenueOverviewType | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyRevenueItem[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartYear, setChartYear] = useState(() => new Date().getFullYear());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [overviewData, monthlyRes, ordersData] = await Promise.all([
                    getRevenueOverview(),
                    getMonthlyRevenue(chartYear),
                    getRecentOrders(5),
                ]);
                setOverview(overviewData);
                setMonthlyData(monthlyRes);
                setRecentOrders(ordersData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [chartYear]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const chartData = monthlyData.map((d) => ({
        name: MONTH_NAMES[d.month - 1],
        month: d.month,
        revenue: Number(d.revenue),
    }));

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary mb-1 sm:mb-2">Dashboard Overview</h1>
                <p className="text-sm sm:text-base text-muted">Welcome to the Elite Lens Management System.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 stagger-children">
                <StatCard
                    title="Total Revenue"
                    value={overview ? formatCurrency(overview.totalRevenue) : "0₫"}
                    icon={<DollarSign size={24} className="text-accent" />}
                    loading={loading}
                />
                <StatCard
                    title="This Month"
                    value={overview ? formatCurrency(overview.monthlyRevenue) : "0₫"}
                    icon={<TrendingUp size={24} className="text-accent" />}
                    loading={loading}
                />
                <StatCard
                    title="Total Orders"
                    value={overview ? overview.totalOrders.toString() : "0"}
                    icon={<ShoppingBag size={24} className="text-accent" />}
                    loading={loading}
                />
                <StatCard
                    title="Customers"
                    value={overview ? overview.totalCustomers.toString() : "0"}
                    icon={<Users size={24} className="text-accent" />}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 glass p-4 sm:p-6 rounded-xl border border-border shadow-sm min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-heading font-semibold text-primary">Revenue Chart</h2>
                        <select
                            value={chartYear}
                            onChange={(e) => setChartYear(Number(e.target.value))}
                            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-primary focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
                        >
                            {[chartYear - 2, chartYear - 1, chartYear, chartYear + 1].map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[200px] sm:min-h-[256px] text-muted bg-secondary/30 rounded-lg border border-dashed border-border animate-pulse">
                            <p className="text-sm">Loading chart...</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex items-center justify-center min-h-[200px] sm:min-h-[256px] text-muted bg-secondary/30 rounded-lg border border-dashed border-border">
                            <p className="text-sm">No revenue data for this year.</p>
                        </div>
                    ) : (
                        <div className="h-48 sm:h-56 lg:h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-accent, #D4AF37)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--color-accent, #D4AF37)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted" />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        width={32}
                                        className="text-muted"
                                        tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name && `${MONTH_NAMES[payload[0].payload.month - 1]} ${chartYear}`}
                                        contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-accent, #D4AF37)"
                                        strokeWidth={2}
                                        fill="url(#revenueGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="glass p-4 sm:p-6 rounded-xl border border-border shadow-sm min-w-0">
                    <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 text-primary">
                        <span>Recent Orders</span>
                        <Link
                            href="/sales/orders"
                            className="text-sm font-medium text-accent cursor-pointer hover:underline"
                        >
                            View All
                        </Link>
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-10 h-10 bg-secondary rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-secondary rounded w-1/2 mb-1" />
                                        <div className="h-3 bg-secondary rounded w-1/4" />
                                    </div>
                                </div>
                            ))
                        ) : recentOrders.length === 0 ? (
                            <p className="text-center text-muted py-8">No recent orders.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/sales/orders/${order.id}`}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 hover:bg-secondary/50 rounded-lg transition-colors border border-transparent hover:border-border min-w-0"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold shrink-0 text-sm">
                                            {(order.customerName || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-primary text-sm truncate">
                                                {order.customerName || "—"}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                                        <p className="font-bold text-primary text-sm">
                                            {formatCurrency(order.finalAmount)}
                                        </p>
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                order.status === "Completed" || order.status === "Paid"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {order.status || "Pending"}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    loading,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm animate-pulse h-[118px]">
                <div className="w-8 h-8 bg-secondary rounded-full mb-4" />
                <div className="h-6 bg-secondary w-1/2 rounded" />
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-border shadow-sm hover:border-accent hover:shadow-md transition-all group overflow-hidden relative min-w-0">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="flex justify-between items-start relative z-10 gap-2">
                <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-medium text-muted mb-1 sm:mb-2">{title}</h3>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-primary break-words">
                        {value}
                    </div>
                </div>
                <div className="p-2 sm:p-3 bg-secondary rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300 shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}
