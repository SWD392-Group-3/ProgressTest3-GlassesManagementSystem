"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getOrders, OrderDto } from "@/lib/api/order";
import { getUser } from "@/lib/auth-storage";

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
  Shipped: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã huỷ",
};

const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-200 text-green-900",
  Cancelled: "bg-red-100 text-red-800",
};

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (
      user.role !== "Sales" &&
      user.role !== "Admin" &&
      user.role !== "Operation"
    ) {
      router.push("/");
      return;
    }
    fetchOrders();
  }, [router, fetchOrders]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    const matchSearch =
      search === "" ||
      (order.id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (order.shippingPhone ?? "").includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-500 text-sm mt-1">
          Danh sách tất cả đơn hàng trong hệ thống
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Tìm theo mã đơn, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            "all",
            "Pending",
            "Paid",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === status
                  ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {status === "all" ? "Tất cả" : STATUS_LABEL[status]}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm font-medium hover:bg-[#C9A030] disabled:opacity-50 transition-colors"
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có đơn hàng nào
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Ngày đặt
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      SĐT giao hàng
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{(order.id ?? "").slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {fmtDate(order.orderDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.shippingPhone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                        {order.shippingAddress ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {fmt(order.finalAmount ?? order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLOR[order.status] ??
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            router.push(`/sales/orders/${order.id}`)
                          }
                          className="text-[#D4AF37] hover:text-[#C9A030] font-medium text-xs underline"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-500">
            Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
          </div>
        </>
      )}
    </div>
  );
}
