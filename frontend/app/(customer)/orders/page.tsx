"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import { getMyOrders, cancelOrder, OrderDto } from "@/lib/api";

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

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  Pending: {
    label: "Chờ xác nhận",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  Paid: {
    label: "Đã thanh toán",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    icon: <RefreshCw className="w-3.5 h-3.5" />,
  },
  Shipped: {
    label: "Đang giao",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-100",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  Delivered: {
    label: "Đã giao",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Cancelled: {
    label: "Đã huỷ",
    color: "text-red-500",
    bg: "bg-red-50 border-red-100",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? {
    label: status,
    color: "text-[#6B7280]",
    bg: "bg-[#F5F5F5] border-[#E5E7EB]",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel(orderId: string) {
    if (!confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")) return;
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o)),
      );
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
              Tài khoản
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Đơn hàng của tôi
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-[#6B7280] mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="text-[#D4AF37] hover:underline font-medium text-sm"
              >
                Thử lại
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <Package className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2
                className="text-2xl font-bold text-[#1A1A1A] mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Chưa có đơn hàng
              </h2>
              <p className="text-[#6B7280] mb-8">
                Bạn chưa đặt hàng nào. Hãy khám phá bộ sưu tập của chúng tôi.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#D4AF37] text-white font-semibold text-sm hover:bg-[#C9A030] transition-colors"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Mã đơn hàng</p>
                        <p className="text-sm font-mono font-semibold text-[#1A1A1A]">
                          #{(order.id ?? "").slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Order body */}
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Ngày đặt
                        </p>
                        <p className="text-[#1A1A1A] font-medium">
                          {fmtDate(order.orderDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Sản phẩm
                        </p>
                        <p className="text-[#1A1A1A] font-medium">
                          {(order.orderItems ?? []).length} items
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Địa chỉ
                        </p>
                        <p className="text-[#1A1A1A] font-medium truncate">
                          {order.shippingAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Tổng tiền
                        </p>
                        <p className="text-[#D4AF37] font-bold text-base">
                          {fmt(order.finalAmount ?? order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between px-5 py-3 bg-[#F5F5F5] border-t border-[#E5E7EB]">
                    {/* Cancel button */}
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {cancellingId === order.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Huỷ đơn
                      </button>
                    )}
                    {order.status !== "Pending" && <span />}
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:text-[#C9A030] transition-colors"
                    >
                      Xem chi tiết
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
