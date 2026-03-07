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
  Clock,
  Truck,
  CheckCircle2,
  Wrench,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { getOrderById, updateOrderStatus, OrderDto } from "@/lib/api/order";
import { getUser } from "@/lib/auth-storage";

// Luồng cho đơn Prescription (có gia công mài kính)
const PRESCRIPTION_STEPS = [
  "Confirmed",
  "ProcessingTemplate",
  "Manufacturing",
  "Shipped",
  "Delivered",
  "Completed",
];
const PRESCRIPTION_NEXT: Record<string, string | null> = {
  Confirmed: "ProcessingTemplate",
  ProcessingTemplate: "Manufacturing",
  Manufacturing: "Shipped",
  Shipped: "Delivered",
  Delivered: null,
  Completed: null,
};

// Luồng cho đơn thông thường (đóng gói & giao hàng)
const REGULAR_STEPS = ["Confirmed", "Shipped", "Delivered", "Completed"];
const REGULAR_NEXT: Record<string, string | null> = {
  Confirmed: "Shipped",
  Shipped: "Delivered",
  Delivered: null,
  Completed: null,
};

// Phát hiện đơn prescription: kiểm tra orderItem có lensesVariantId
// hoặc note bắt đầu bằng "Prescription #" (đặt bởi PrescriptionService.ConfirmAsync)
function isPrescriptionOrder(order: OrderDto | null): boolean {
  if (!order) return false;
  return order.orderItems.some(
    (item) =>
      item.lensesVariantId != null ||
      (item.note ?? "").startsWith("Prescription #"),
  );
}

// Luồng chung cho các trạng thái bên ngoài luồng Operation
const FALLBACK_NEXT: Record<string, string | null> = {
  Pending: null,
  Paid: null,
  Cancelled: null,
};

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Paid: "Đã thanh toán",
  Confirmed: "Chờ xử lý (Mới)",
  ProcessingTemplate: "Đang xử lý mẫu",
  Manufacturing: "Đang mài kính",
  Shipped: "Đang giao",
  Delivered: "Đã giao",
  Completed: "Hoàn thành",
  Cancelled: "Đã huỷ",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-4 h-4" />,
  Paid: <CheckCircle2 className="w-4 h-4" />,
  Confirmed: <RefreshCw className="w-4 h-4" />,
  ProcessingTemplate: <FileText className="w-4 h-4" />,
  Manufacturing: <Wrench className="w-4 h-4" />,
  Shipped: <Truck className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
  Completed: <CheckCircle2 className="w-4 h-4" />,
  Cancelled: <XCircle className="w-4 h-4" />,
};

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OperationOrderProcessingPage() {
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
    if (user.role !== "Operation" && user.role !== "Admin") {
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

  // Tự động chọn luồng phù hợp theo loại đơn
  const isPrescription = isPrescriptionOrder(order);
  const STATUS_STEPS = isPrescription ? PRESCRIPTION_STEPS : REGULAR_STEPS;
  const NEXT_MAP = isPrescription ? PRESCRIPTION_NEXT : REGULAR_NEXT;

  const isCancelled = order?.status === "Cancelled";
  const isCompleted = order?.status === "Completed";
  const currentStepIndex =
    isCancelled || isCompleted
      ? isCompleted
        ? STATUS_STEPS.length - 1
        : -1
      : STATUS_STEPS.indexOf(order?.status ?? "");
  const nextStatus = order
    ? (NEXT_MAP[order.status] ?? FALLBACK_NEXT[order.status] ?? null)
    : null;

  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
            Chi tiết xử lý đơn
          </p>
          <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight mt-0.5">
            #{(orderId ?? "").slice(0, 8).toUpperCase()}
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
          <p className="font-semibold mb-1">Đã có lỗi xảy ra</p>
          <p>{error}</p>
          <button
            onClick={fetchOrder}
            className="mt-2 text-red-600 underline text-xs font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4">
          {successMsg}
        </div>
      )}

      {!loading && order && (
        <div className="space-y-6">
          {/* Badge loại đơn */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isPrescription
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isPrescription ? (
                <>
                  <Wrench className="w-3 h-3" /> Đơn Prescription (Gia công
                  kính)
                </>
              ) : (
                <>
                  <Package className="w-3 h-3" /> Đơn thường (Đóng gói & giao)
                </>
              )}
            </span>
          </div>

          {/* Progress bar dành cho Operation */}
          {!isCancelled ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-6">
                Tiến trình xử lý tại Xưởng
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
                          className={`absolute top-5 left-1/2 w-full h-[2px] transition-colors ${
                            idx < currentStepIndex
                              ? "bg-[#D4AF37]"
                              : "bg-gray-100"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          step === "Completed" && done
                            ? "bg-green-500 text-white shadow-md shadow-green-300"
                            : done
                              ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/30"
                              : "bg-gray-50 text-gray-300 border border-gray-200"
                        } ${active ? "ring-4 ring-[#D4AF37]/20 scale-110" : ""}`}
                      >
                        {STATUS_ICON[step]}
                      </div>
                      <p
                        className={`text-xs font-bold mt-3 text-center ${
                          step === "Completed" && done
                            ? "text-green-600"
                            : done
                              ? "text-[#D4AF37]"
                              : "text-gray-400"
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
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-600">
                Đơn hàng đã bị huỷ
              </p>
            </div>
          )}

          {/* Banner hoàn thành — khách hàng đã xác nhận nhận hàng */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">
                  Đơn hàng đã hoàn thành
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Khách hàng đã xác nhận nhận hàng thành công.
                </p>
              </div>
            </div>
          )}

          {/* Action: Cập nhật trạng thái ngay lập tức trên đầu */}
          {!isCancelled && !isCompleted && nextStatus && (
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-2xl border border-[#D4AF37]/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[#111827]">
                  Trạng thái xử lý
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Đơn đang ở trạng thái:{" "}
                  <strong className="text-gray-900">
                    {STATUS_LABEL[order.status]}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updateLoading}
                className="px-6 py-3 bg-[#D4AF37] text-white text-sm font-bold rounded-xl hover:bg-[#C9A030] shadow-lg shadow-[#D4AF37]/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {updateLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  STATUS_ICON[nextStatus]
                )}
                Chuyển sang &ldquo;{STATUS_LABEL[nextStatus]}&rdquo;
              </button>
            </div>
          )}

          {/* Chi tiết đơn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vận chuyển */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Nhận hàng / Giao hàng
              </h2>
              <div className="space-y-3">
                <div className="flex px-3 py-2.5 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0 mr-3" />
                  <span className="text-sm text-gray-800 font-medium">
                    {order.shippingAddress}
                  </span>
                </div>
                <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0 mr-3" />
                  <span className="text-sm text-gray-800 font-bold">
                    {order.shippingPhone}
                  </span>
                </div>
                <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mr-3" />
                  <span className="text-sm text-gray-600">
                    {fmtDate(order.orderDate)}
                  </span>
                </div>
                {order.note && (
                  <div className="flex items-start px-3 py-2.5 bg-[#D4AF37]/5 rounded-lg border border-[#D4AF37]/20">
                    <FileText className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0 mr-3" />
                    <div>
                      <span className="text-xs font-semibold text-[#D4AF37] block mb-0.5">
                        Ghi chú
                      </span>
                      <span className="text-sm text-gray-800 break-words">
                        {order.note}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mục cần làm (Order Items) */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gray-50">
                <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  Chi tiết sản phẩm cần xử lý ({(order.orderItems ?? []).length}
                  )
                </h2>
              </div>
              <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[300px]">
                {(order.orderItems ?? []).length === 0 ? (
                  <p className="px-6 py-5 text-sm text-gray-400 text-center">
                    Không có nguyên liệu/sản phẩm
                  </p>
                ) : (
                  (order.orderItems ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {item.productVariantId
                              ? "Gọng kính"
                              : item.lensesVariantId
                                ? "Tròng kính"
                                : item.comboItemId
                                  ? "Combo"
                                  : "Dịch vụ"}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            ID:{" "}
                            {(
                              item.productVariantId ??
                              item.lensesVariantId ??
                              item.comboItemId ??
                              item.serviceId ??
                              "—"
                            ).slice(0, 12)}
                            ...
                          </p>
                          {item.note && (
                            <p className="text-xs text-[#D4AF37] italic mt-1 bg-[#D4AF37]/10 px-2 py-0.5 rounded inline-block">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                          Số lượng:{" "}
                          <strong className="text-gray-900 text-sm">
                            {item.quantity}
                          </strong>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
