"use client";

import { useState, useCallback } from "react";
import {
  Search,
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
  AlertCircle,
} from "lucide-react";
import { getOrderById, updateOrderStatus, OrderDto } from "@/lib/api";

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

const STATUS_OPTIONS = [
  { value: "Pending", label: "Chờ xác nhận" },
  { value: "Processing", label: "Đang xử lý" },
  { value: "Shipped", label: "Đang giao" },
  { value: "Delivered", label: "Đã giao" },
  { value: "Cancelled", label: "Đã huỷ" },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-4 h-4" />,
  Processing: <RefreshCw className="w-4 h-4" />,
  Shipped: <Truck className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
  Cancelled: <XCircle className="w-4 h-4" />,
};

export default function StaffOrdersPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    const id = orderIdInput.trim();
    if (!id) {
      setError("Vui lòng nhập mã đơn hàng.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setOrder(null);
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [orderIdInput]);

  async function handleUpdateStatus(newStatus: string) {
    if (!order) return;
    if (!confirm(`Cập nhật trạng thái đơn thành "${newStatus}"?`)) return;
    setUpdating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await updateOrderStatus(order.orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      setSuccessMsg(`Đã cập nhật trạng thái thành "${newStatus}".`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
          Nhân viên
        </span>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Quản lý đơn hàng
        </h1>
        <p className="text-[#6B7280] mt-1">
          Tra cứu đơn hàng theo mã và cập nhật trạng thái.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
          Mã đơn hàng
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchOrder()}
              placeholder="Nhập ID đơn hàng (ví dụ: c1000000-0000-0000-...)"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10"
            />
          </div>
          <button
            onClick={fetchOrder}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#1A1A1A] text-white font-semibold text-sm hover:bg-[#333] disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Tra cứu
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Status update */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              Cập nhật trạng thái
            </h2>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdateStatus(opt.value)}
                  disabled={updating || order.status === opt.value}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    order.status === opt.value
                      ? "bg-[#D4AF37] text-[#1A1A1A] border-[#D4AF37]"
                      : "bg-white border-[#E5E7EB] text-[#1A1A1A] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
                  } disabled:opacity-60`}
                >
                  {STATUS_ICON[opt.value]}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Giao hàng
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <span className="text-[#1A1A1A]">{order.shippingAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#6B7280] shrink-0" />
                  <span className="text-[#1A1A1A]">{order.shippingPhone}</span>
                </div>
                {order.note && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                    <span className="text-[#6B7280] italic">{order.note}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6B7280] shrink-0" />
                  <span className="text-[#6B7280]">
                    {fmtDate(order.orderDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                Thanh toán
              </h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Tạm tính</span>
                  <span className="text-[#1A1A1A]">{fmt(order.totalAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Giảm giá</span>
                    <span className="text-green-600">
                      - {fmt(order.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-[#E5E7EB]" />
                <div className="flex justify-between font-bold">
                  <span className="text-[#1A1A1A]">Tổng cộng</span>
                  <span className="text-[#D4AF37] text-lg">
                    {fmt(order.finalAmount ?? order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                Sản phẩm ({(order.items ?? []).length})
              </h2>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {(order.items ?? []).map((item) => (
                <div
                  key={item.orderItemId}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {item.productVariantId
                          ? "Gọng kính"
                          : item.lensesVariantId
                            ? "Tròng kính"
                            : item.comboItemId
                              ? "Combo"
                              : "Dịch vụ"}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        SL: {item.quantity} × {fmt(item.unitPrice)}
                      </p>
                      {item.note && (
                        <p className="text-xs text-[#9CA3AF] italic">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A] shrink-0">
                    {fmt(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
