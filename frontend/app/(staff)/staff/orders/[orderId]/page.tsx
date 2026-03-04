"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { getOrderById, updateOrderStatus, OrderDto } from "@/lib/api/order";
import { getUser } from "@/lib/auth-storage";

const STATUS_STEPS = ["Pending", "Paid", "Confirmed", "Shipped", "Delivered"];

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
  Shipped: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã huỷ",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-4 h-4" />,
  Paid: <CheckCircle2 className="w-4 h-4" />,
  Confirmed: <RefreshCw className="w-4 h-4" />,
  Shipped: <Truck className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
  Cancelled: <XCircle className="w-4 h-4" />,
};

// Bước tiếp theo hợp lệ cho từng trạng thái
const NEXT_STATUS: Record<string, string | null> = {
  Pending: null,
  Paid: "Confirmed",
  Confirmed: "Shipped",
  Shipped: "Delivered",
  Delivered: null,
  Cancelled: null,
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

export default function StaffOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "Staff" && user.role !== "Operation") {
      router.push("/");
      return;
    }
    fetchOrder();
  }, [router, fetchOrder]);

  async function handleUpdateStatus(newStatus: string) {
    if (!order) return;
    if (
      !confirm(`Xác nhận chuyển trạng thái sang "${STATUS_LABEL[newStatus]}"?`)
    )
      return;

    setUpdateLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      setSuccessMsg(
        `Đã cập nhật trạng thái thành "${STATUS_LABEL[newStatus]}".`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdateLoading(false);
    }
  }

  const isCancelled = order?.status === "Cancelled";
  const currentStepIndex = isCancelled
    ? -1
    : STATUS_STEPS.indexOf(order?.status ?? "");
  const nextStatus = order ? NEXT_STATUS[order.status] : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Chi tiết đơn hàng
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            #{(orderId ?? "").slice(0, 8).toUpperCase()}
          </h1>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchOrder}
            className="text-red-600 underline text-xs"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
          {successMsg}
        </div>
      )}

      {!loading && order && (
        <div className="space-y-5">
          {/* Progress bar */}
          {!isCancelled ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Tiến trình đơn hàng
              </h2>
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const active = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className="flex-1 flex flex-col items-center relative"
                    >
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${
                            idx < currentStepIndex
                              ? "bg-[#D4AF37]"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          done
                            ? "bg-[#D4AF37] text-white"
                            : "bg-gray-100 text-gray-400"
                        } ${active ? "ring-4 ring-[#D4AF37]/20" : ""}`}
                      >
                        {STATUS_ICON[step]}
                      </div>
                      <p
                        className={`text-[10px] font-semibold mt-2 text-center leading-tight ${
                          done ? "text-[#D4AF37]" : "text-gray-400"
                        }`}
                      >
                        {STATUS_LABEL[step]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-600">
                Đơn hàng đã bị huỷ
              </p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Shipping */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Thông tin giao hàng
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{order.shippingAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700">{order.shippingPhone}</span>
                </div>
                {order.note && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-500 italic">{order.note}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500">
                    {fmtDate(order.orderDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                Tóm tắt thanh toán
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="text-gray-800">
                    {fmt(order.totalAmount)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giảm giá</span>
                    <span className="text-green-600">
                      - {fmt(order.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                  <span className="text-gray-800">Tổng cộng</span>
                  <span className="text-[#D4AF37] text-base">
                    {fmt(order.finalAmount ?? order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                Sản phẩm ({(order.orderItems ?? []).length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(order.orderItems ?? []).length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">
                  Không có sản phẩm
                </p>
              ) : (
                (order.orderItems ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.productVariantId
                            ? "Gọng kính"
                            : item.lensesVariantId
                              ? "Tròng kính"
                              : item.comboItemId
                                ? "Combo"
                                : "Dịch vụ"}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          ID:{" "}
                          {(
                            item.productVariantId ??
                            item.lensesVariantId ??
                            item.comboItemId ??
                            item.serviceId ??
                            "—"
                          ).slice(0, 8)}
                          ...
                        </p>
                        {item.note && (
                          <p className="text-xs text-gray-400 italic">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">
                        {fmt(item.unitPrice)} × {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {fmt(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action: update status */}
          {!isCancelled && nextStatus && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Cập nhật trạng thái
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 text-sm text-gray-500">
                  Trạng thái hiện tại:{" "}
                  <span className="font-semibold text-gray-800">
                    {STATUS_LABEL[order.status]}
                  </span>
                  {" → "}
                  <span className="font-semibold text-[#D4AF37]">
                    {STATUS_LABEL[nextStatus]}
                  </span>
                </div>
                <button
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={updateLoading}
                  className="px-5 py-2 bg-[#D4AF37] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A030] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {updateLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    STATUS_ICON[nextStatus]
                  )}
                  Chuyển sang &ldquo;{STATUS_LABEL[nextStatus]}&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
