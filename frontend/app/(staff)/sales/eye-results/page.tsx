"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Loader2,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import { getOrders, OrderDto } from "@/lib/api/order";
import { getUser } from "@/lib/auth-storage";

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, string> = {
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
  Shipped: "Đang giao",
  Delivered: "Đã giao",
  Completed: "Hoàn thành",
};

const STATUS_COLOR: Record<string, string> = {
  Paid: "bg-blue-100 text-blue-700",
  Confirmed: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-orange-100 text-orange-700",
  Delivered: "bg-teal-100 text-teal-700",
  Completed: "bg-green-100 text-green-700",
};

// Orders relevant for eye-exam: must have at least one service item
// and must NOT be Pending / Cancelled
const RELEVANT_STATUSES = [
  "Paid",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Completed",
];

export default function EyeResultsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "Sales" && user.role !== "Admin") {
      router.push("/");
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrders();
        // Keep only orders with at least one service item and relevant status
        const filtered = data.filter(
          (o) =>
            RELEVANT_STATUSES.includes(o.status) &&
            o.orderItems?.some((i) => i.serviceId != null),
        );
        // Sort: Paid first, then by date desc
        filtered.sort((a, b) => {
          const priorityA = a.status === "Paid" ? 0 : 1;
          const priorityB = b.status === "Paid" ? 0 : 1;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return (
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
        });
        setOrders(filtered);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.shippingPhone.includes(q) ||
        o.shippingAddress.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const pendingCount = orders.filter((o) => o.status === "Paid").length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Kết quả khám mắt
            </h1>
            <p className="text-sm text-[#6B7280]">
              Đơn hàng có dịch vụ khám mắt cần ghi kết quả
            </p>
          </div>
        </div>

        {/* Pending badge */}
        {pendingCount > 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 w-fit">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              <strong>{pendingCount}</strong> đơn đã thanh toán đang chờ ghi kết
              quả
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Tìm theo mã đơn, số điện thoại, địa chỉ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
        />
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-[#D4AF37]/50" />
          </div>
          <p className="text-[#6B7280] font-medium">Không có đơn hàng nào</p>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {search
              ? "Không tìm thấy kết quả phù hợp."
              : "Chưa có đơn hàng dịch vụ nào cần ghi kết quả."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.5fr_1.2fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Mã đơn
            </span>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Ngày đặt
            </span>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              SĐT
            </span>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Trạng thái
            </span>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Thao tác
            </span>
          </div>

          <div className="divide-y divide-[#F5F5F5]">
            {filtered.map((order) => {
              const serviceItems =
                order.orderItems?.filter((i) => i.serviceId != null) ?? [];
              const isPaid = order.status === "Paid";

              return (
                <div
                  key={order.id}
                  className={`grid grid-cols-[1fr_1.5fr_1.2fr_1fr_auto] gap-3 items-center px-5 py-4 hover:bg-[#FAFAFA] transition-colors ${
                    isPaid ? "bg-blue-50/40" : ""
                  }`}
                >
                  {/* Order ID */}
                  <div className="flex items-center gap-2">
                    {isPaid && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {serviceItems.length} dịch vụ
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-sm text-[#6B7280]">
                    {fmtDate(order.orderDate)}
                  </p>

                  {/* Phone */}
                  <p className="text-sm text-[#1A1A1A]">
                    {order.shippingPhone}
                  </p>

                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                      STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isPaid ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>

                  {/* Action */}
                  <Link
                    href={`/sales/orders/${order.id}?tab=eye-result`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-white text-xs font-semibold rounded-lg hover:bg-[#C9A030] transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ghi kết quả
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Service items legend */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs text-[#9CA3AF] mt-4 text-center">
          Hiển thị {filtered.length} đơn hàng có dịch vụ khám mắt · Ưu tiên đơn
          &ldquo;Đã thanh toán&rdquo; lên đầu
        </p>
      )}
    </div>
  );
}
