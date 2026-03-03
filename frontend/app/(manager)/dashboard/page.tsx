"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";

type RevenueOverview = {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    monthlyRevenue: number;
};

type RecentOrder = {
    id: string;
    customerName: string;
    finalAmount: number;
    status: string;
    orderDate: string;
};

export default function ManagerDashboard() {
    const [overview, setOverview] = useState<RevenueOverview | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [overviewRes, ordersRes] = await Promise.all([
                    fetch("http://localhost:5000/api/manager/revenue/overview").catch(() => null),
                    fetch("http://localhost:5000/api/manager/revenue/recent-orders?count=5").catch(() => null)
                ]);

                if (overviewRes?.ok) {
                    const data = await overviewRes.json();
                    setOverview(data);
                }

                if (ordersRes?.ok) {
                    const data = await ordersRes.json();
                    setRecentOrders(data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-primary mb-2">Dashboard Overview</h1>
                <p className="text-muted">Welcome to the Elite Lens Management System.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
                <StatCard
                    title="Total Revenue"
                    value={overview ? formatCurrency(overview.totalRevenue) : "$0.00"}
                    icon={<DollarSign size={24} className="text-accent" />}
                    loading={loading}
                />
                <StatCard
                    title="This Month"
                    value={overview ? formatCurrency(overview.monthlyRevenue) : "$0.00"}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-xl font-heading font-semibold mb-6 text-primary">Revenue Chart</h2>
                    <div className="flex items-center justify-center h-64 text-muted bg-secondary/30 rounded-lg border border-dashed border-border">
                        <p>Chart functionality will be implemented with Recharts/Chart.js</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-xl font-heading font-semibold mb-6 flex items-center justify-between text-primary">
                        <span>Recent Orders</span>
                        <span className="text-sm font-medium text-accent cursor-pointer hover:underline">View All</span>
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-10 h-10 bg-secondary rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-secondary rounded w-1/2 mb-1"></div>
                                        <div className="h-3 bg-secondary rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))
                        ) : recentOrders.length === 0 ? (
                            <p className="text-center text-muted py-8">No recent orders.</p>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-primary text-sm">{order.customerName}</p>
                                            <p className="text-xs text-muted">{new Date(order.orderDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary text-sm">{formatCurrency(order.finalAmount)}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${order.status === "Completed" || order.status === "Paid"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {order.status || "Pending"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, loading }: { title: string, value: string, icon: React.ReactNode, loading: boolean }) {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm animate-pulse h-[118px]">
                <div className="w-8 h-8 bg-secondary rounded-full mb-4"></div>
                <div className="h-6 bg-secondary w-1/2 rounded"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm hover:border-accent hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-sm font-medium text-muted mb-2">{title}</h3>
                    <div className="text-3xl font-heading font-bold text-primary">{value}</div>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                    {icon}
                </div>
            </div>
        </div>
    );
}
