"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
  Eye,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { getOrderById, confirmOrder, updateOrderStatus, OrderDto } from "@/lib/api/order";
import {
  getEyeResultsByOrder,
  createEyeResult,
  updateEyeResult,
  deleteEyeResult,
  EyeResultDto,
} from "@/lib/api/eye-result";
import { getUser } from "@/lib/auth-storage";

const STATUS_STEPS = ["Pending", "Paid", "Confirmed", "Shipped", "Delivered"];
const STATUS_STEPS_SERVICE = ["Pending", "Paid", "Confirmed", "Completed"];

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
  Shipped: "Đang giao",
  Delivered: "Đã giao",
  Completed: "Hoàn thành",
  Cancelled: "Đã huỷ",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-4 h-4" />,
  Paid: <CheckCircle2 className="w-4 h-4" />,
  Confirmed: <RefreshCw className="w-4 h-4" />,
  Shipped: <Truck className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
  Completed: <CheckCircle2 className="w-4 h-4" />,
  Cancelled: <XCircle className="w-4 h-4" />,
};

// Sales: đơn giao hàng chỉ chuyển tới Confirmed; đơn dịch vụ có thể chuyển Confirmed -> Completed
const NEXT_STATUS: Record<string, string | null> = {
  Pending: null,
  Paid: "Confirmed",
  Confirmed: null,
  Shipped: null,
  Delivered: null,
  Cancelled: null,
};
const NEXT_STATUS_SERVICE: Record<string, string | null> = {
  Pending: null,
  Paid: "Confirmed",
  Confirmed: "Completed",
  Completed: null,
  Cancelled: null,
};

// Structured eye data per eye
interface EyeFields {
  sph: string; // Sphere (S) — độ cầu, e.g. "-1.50"
  cyl: string; // Cylinder (C) — độ trụ, e.g. "-0.50"
  axis: string; // Axis (A) — trục, e.g. "10"
}

const EMPTY_EYE: EyeFields = { sph: "", cyl: "", axis: "" };

const EMPTY_FORM = {
  left: { ...EMPTY_EYE } as EyeFields,
  right: { ...EMPTY_EYE } as EyeFields,
  vien: false,
  loan: false,
  can: "" as string | number,
  note: "",
};

/** Build "S: -1.50, C: -0.50, A: 10" string from structured fields */
function buildEyeString(e: EyeFields): string | undefined {
  const parts: string[] = [];
  if (e.sph.trim()) parts.push(`S: ${e.sph.trim()}`);
  if (e.cyl.trim()) parts.push(`C: ${e.cyl.trim()}`);
  if (e.axis.trim()) parts.push(`A: ${e.axis.trim()}`);
  return parts.length ? parts.join(", ") : undefined;
}

/** Parse "S: -1.50, C: -0.50, A: 10" back to structured fields */
function parseEyeString(str: string | null | undefined): EyeFields {
  if (!str) return { ...EMPTY_EYE };
  const get = (key: string) => {
    const m = str.match(new RegExp(`${key}:\\s*([\\d.+-]+)`));
    return m ? m[1] : "";
  };
  return { sph: get("S"), cyl: get("C"), axis: get("A") };
}

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

export default function SalesOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab state: "order" | "eye-result" — initialised from ?tab= query param
  const [activeTab, setActiveTab] = useState<"order" | "eye-result">(
    searchParams?.get("tab") === "eye-result" ? "eye-result" : "order",
  );

  // Eye result state
  const [eyeResults, setEyeResults] = useState<EyeResultDto[]>([]);
  const [eyeLoading, setEyeLoading] = useState(false);
  const [eyeError, setEyeError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

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

  const fetchEyeResults = useCallback(async () => {
    if (!orderId) return;
    setEyeLoading(true);
    setEyeError(null);
    try {
      const data = await getEyeResultsByOrder(orderId);
      setEyeResults(data);
    } catch (e) {
      setEyeError((e as Error).message);
    } finally {
      setEyeLoading(false);
    }
  }, [orderId]);

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
    fetchOrder();
  }, [router, fetchOrder]);

  // Load eye results when tab is first opened
  useEffect(() => {
    if (activeTab === "eye-result" && orderId) {
      fetchEyeResults();
    }
  }, [activeTab, orderId, fetchEyeResults]);

  // Determine if order has any service items
  const hasServiceItems =
    order?.orderItems?.some((i) => i.serviceId != null) ?? false;

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEditForm(r: EyeResultDto) {
    setEditingId(r.id);
    setForm({
      left: parseEyeString(r.eyeLeft),
      right: parseEyeString(r.eyeRight),
      vien: r.vien,
      loan: r.loan,
      can: r.can ?? "",
      note: r.note ?? "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  async function handleSaveEyeResult() {
    if (!orderId) return;
    setFormSaving(true);
    setEyeError(null);
    try {
      const canVal =
        form.can === "" || form.can === null ? null : Number(form.can);
      if (editingId) {
        const updated = await updateEyeResult(editingId, {
          eyeLeft: buildEyeString(form.left),
          eyeRight: buildEyeString(form.right),
          vien: form.vien,
          loan: form.loan,
          can: canVal,
          note: form.note || undefined,
        });
        setEyeResults((prev) =>
          prev.map((r) => (r.id === editingId ? updated : r)),
        );
      } else {
        const created = await createEyeResult({
          orderId,
          eyeLeft: buildEyeString(form.left),
          eyeRight: buildEyeString(form.right),
          vien: form.vien,
          loan: form.loan,
          can: canVal,
          note: form.note || undefined,
        });
        setEyeResults((prev) => [created, ...prev]);
      }
      cancelForm();
    } catch (e) {
      setEyeError((e as Error).message);
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDeleteEyeResult(id: string) {
    if (!confirm("Xác nhận xoá kết quả đo mắt này?")) return;
    setEyeError(null);
    try {
      await deleteEyeResult(id);
      setEyeResults((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setEyeError((e as Error).message);
    }
  }

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
      if (newStatus === "Confirmed") {
        await confirmOrder(order.id);
      } else {
        await updateOrderStatus(order.id, newStatus);
      }
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
  const isServiceOrder =
    order != null &&
    (order.shippingAddress == null || order.shippingAddress === "") &&
    (order.shippingPhone == null || order.shippingPhone === "");
  const steps = isServiceOrder ? STATUS_STEPS_SERVICE : STATUS_STEPS;
  const nextStatusMap = isServiceOrder ? NEXT_STATUS_SERVICE : NEXT_STATUS;
  const currentStepIndex = isCancelled
    ? -1
    : steps.indexOf(order?.status ?? "");
  const nextStatus = order ? (nextStatusMap[order.status] ?? null) : null;

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
          {/* Tabs */}
          <div className="flex border-b border-gray-200 gap-1">
            <button
              onClick={() => setActiveTab("order")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${
                activeTab === "order"
                  ? "bg-white border border-b-white border-gray-200 text-[#D4AF37]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4" />
              Đơn hàng
            </button>
            {hasServiceItems && (
              <button
                onClick={() => setActiveTab("eye-result")}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${
                  activeTab === "eye-result"
                    ? "bg-white border border-b-white border-gray-200 text-[#D4AF37]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Eye className="w-4 h-4" />
                Kết quả khám mắt
              </button>
            )}
          </div>

          {/* ── TAB: ORDER ── */}
          {activeTab === "order" && (
            <>
              {/* Progress bar */}
              {!isCancelled ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Tiến trình đơn hàng
                  </h2>
                  <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                      const done = idx <= currentStepIndex;
                      const active = idx === currentStepIndex;
                      return (
                        <div
                          key={step}
                          className="flex-1 flex flex-col items-center relative"
                        >
                          {idx < steps.length - 1 && (
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
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    Thông tin giao hàng
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-gray-700">
                        {order.shippingAddress ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700">
                        {order.shippingPhone ?? "—"}
                      </span>
                    </div>
                    {order.note && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-gray-500 italic">
                          {order.note}
                        </span>
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
                              {item.productName ??
                                (item.productVariantId
                                  ? "Gọng kính"
                                  : item.lensesVariantId
                                    ? "Tròng kính"
                                    : item.comboItemId
                                      ? "Combo"
                                      : "Dịch vụ")}
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
            </>
          )}

          {/* ── TAB: EYE RESULT ── */}
          {activeTab === "eye-result" && (
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                  Kết quả khám mắt ({eyeResults.length})
                </h2>
                {!showForm && (
                  <button
                    onClick={openCreateForm}
                    className="px-3 py-1.5 bg-[#D4AF37] text-white text-xs font-semibold rounded-lg hover:bg-[#C9A030] transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm kết quả
                  </button>
                )}
              </div>

              {/* Eye result error */}
              {eyeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {eyeError}
                </div>
              )}

              {/* Create / Edit form */}
              {showForm && (
                <div className="bg-white rounded-2xl border border-[#D4AF37]/50 overflow-hidden shadow-sm">
                  {/* Form header */}
                  <div className="px-5 py-3.5 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-b border-[#D4AF37]/30 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-[#1A1A1A]">
                      {editingId
                        ? "Chỉnh sửa kết quả khám mắt"
                        : "Ghi kết quả khám mắt"}
                    </h3>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Eye grid: Left | Right side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left eye */}
                      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="px-4 py-2.5 bg-blue-50 border-b border-[#E5E7EB] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                            L
                          </span>
                          <span className="text-xs font-semibold text-blue-700">
                            Mắt trái (OS)
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                              SPH — Độ cầu
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.25"
                                placeholder="0.00"
                                value={form.left.sph}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    left: { ...form.left, sph: e.target.value },
                                  })
                                }
                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                                D
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                              CYL — Độ trụ
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.25"
                                placeholder="0.00"
                                value={form.left.cyl}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    left: { ...form.left, cyl: e.target.value },
                                  })
                                }
                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                                D
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                              AXIS — Trục
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="180"
                                placeholder="0"
                                value={form.left.axis}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    left: {
                                      ...form.left,
                                      axis: e.target.value,
                                    },
                                  })
                                }
                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                                °
                              </span>
                            </div>
                          </div>
                          {/* Preview */}
                          {(form.left.sph ||
                            form.left.cyl ||
                            form.left.axis) && (
                            <p className="text-[11px] text-[#D4AF37] font-mono bg-[#D4AF37]/5 rounded px-2 py-1">
                              {buildEyeString(form.left) ?? "—"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right eye */}
                      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="px-4 py-2.5 bg-emerald-50 border-b border-[#E5E7EB] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                            R
                          </span>
                          <span className="text-xs font-semibold text-emerald-700">
                            Mắt phải (OD)
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                              SPH — Độ cầu
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.25"
                                placeholder="0.00"
                                value={form.right.sph}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    right: {
                                      ...form.right,
                                      sph: e.target.value,
                                    },
                                  })
                                }
                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                                D
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                              CYL — Độ trụ
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.25"
                                placeholder="0.00"
                                value={form.right.cyl}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    right: {
                                      ...form.right,
                                      cyl: e.target.value,
                                    },
                                  })
                                }
                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                                D
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                              AXIS — Trục
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="180"
                                placeholder="0"
                                value={form.right.axis}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    right: {
                                      ...form.right,
                                      axis: e.target.value,
                                    },
                                  })
                                }
                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-8"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                                °
                              </span>
                            </div>
                          </div>
                          {/* Preview */}
                          {(form.right.sph ||
                            form.right.cyl ||
                            form.right.axis) && (
                            <p className="text-[11px] text-emerald-600 font-mono bg-emerald-50 rounded px-2 py-1">
                              {buildEyeString(form.right) ?? "—"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Conditions row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Độ cận */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                          Độ cận (CAN)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="25"
                            min="0"
                            placeholder="0"
                            value={form.can}
                            onChange={(e) =>
                              setForm({ ...form, can: e.target.value })
                            }
                            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">
                            độ
                          </span>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="md:col-span-2 flex items-end gap-6 pb-1">
                        <label
                          className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all select-none ${
                            form.vien
                              ? "border-amber-400 bg-amber-50"
                              : "border-[#E5E7EB] bg-white hover:border-amber-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.vien}
                            onChange={(e) =>
                              setForm({ ...form, vien: e.target.checked })
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              form.vien
                                ? "bg-amber-400 border-amber-400"
                                : "border-gray-300"
                            }`}
                          >
                            {form.vien && (
                              <span className="text-white text-[10px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              Viễn thị
                            </p>
                            <p className="text-[10px] text-[#9CA3AF]">
                              Hyperopia
                            </p>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all select-none ${
                            form.loan
                              ? "border-purple-400 bg-purple-50"
                              : "border-[#E5E7EB] bg-white hover:border-purple-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.loan}
                            onChange={(e) =>
                              setForm({ ...form, loan: e.target.checked })
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              form.loan
                                ? "bg-purple-400 border-purple-400"
                                : "border-gray-300"
                            }`}
                          >
                            {form.loan && (
                              <span className="text-white text-[10px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              Loạn thị
                            </p>
                            <p className="text-[10px] text-[#9CA3AF]">
                              Astigmatism
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                        Ghi chú / Khuyến nghị
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Nhập khuyến nghị hoặc ghi chú thêm cho khách hàng..."
                        value={form.note}
                        onChange={(e) =>
                          setForm({ ...form, note: e.target.value })
                        }
                        className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-1 border-t border-[#F5F5F5]">
                      <button
                        onClick={cancelForm}
                        className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={handleSaveEyeResult}
                        disabled={formSaving}
                        className="px-5 py-2 text-sm font-semibold bg-[#D4AF37] text-white rounded-lg hover:bg-[#C9A030] disabled:opacity-50 flex items-center gap-2 transition-colors"
                      >
                        {formSaving && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {editingId ? "Lưu thay đổi" : "Lưu kết quả"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Eye result list */}
              {eyeLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                </div>
              ) : eyeResults.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <Eye className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    Chưa có kết quả đo mắt nào.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Nhấn &ldquo;Thêm kết quả&rdquo; để bắt đầu.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eyeResults.map((r) => {
                    const L = parseEyeString(r.eyeLeft);
                    const R = parseEyeString(r.eyeRight);
                    return (
                      <div
                        key={r.id}
                        className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden"
                      >
                        {/* Card header */}
                        <div className="px-5 py-3 border-b border-[#F5F5F5] flex items-center justify-between">
                          <p className="text-xs text-[#6B7280]">
                            Nhân viên:{" "}
                            <span className="font-semibold text-[#1A1A1A]">
                              {r.staffName ?? "—"}
                            </span>
                          </p>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditForm(r)}
                              className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#9CA3AF] hover:text-[#D4AF37] transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEyeResult(r.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
                              title="Xoá"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Prescription table */}
                        <div className="px-5 py-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">
                                <th className="text-left pb-2 w-28">Mắt</th>
                                <th className="text-center pb-2">
                                  SPH (Độ cầu)
                                </th>
                                <th className="text-center pb-2">
                                  CYL (Độ trụ)
                                </th>
                                <th className="text-center pb-2">
                                  AXIS (Trục)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5F5F5]">
                              <tr>
                                <td className="py-2.5 pr-3">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                                      L
                                    </span>
                                    <span className="text-xs font-semibold text-[#1A1A1A]">
                                      Trái (OS)
                                    </span>
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={`font-mono text-sm font-semibold ${L.sph ? "text-[#1A1A1A]" : "text-[#D1D5DB]"}`}
                                  >
                                    {L.sph || "—"}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={`font-mono text-sm font-semibold ${L.cyl ? "text-[#1A1A1A]" : "text-[#D1D5DB]"}`}
                                  >
                                    {L.cyl || "—"}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={`font-mono text-sm font-semibold ${L.axis ? "text-[#1A1A1A]" : "text-[#D1D5DB]"}`}
                                  >
                                    {L.axis ? `${L.axis}°` : "—"}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pr-3">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                                      R
                                    </span>
                                    <span className="text-xs font-semibold text-[#1A1A1A]">
                                      Phải (OD)
                                    </span>
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={`font-mono text-sm font-semibold ${R.sph ? "text-[#1A1A1A]" : "text-[#D1D5DB]"}`}
                                  >
                                    {R.sph || "—"}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={`font-mono text-sm font-semibold ${R.cyl ? "text-[#1A1A1A]" : "text-[#D1D5DB]"}`}
                                  >
                                    {R.cyl || "—"}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={`font-mono text-sm font-semibold ${R.axis ? "text-[#1A1A1A]" : "text-[#D1D5DB]"}`}
                                  >
                                    {R.axis ? `${R.axis}°` : "—"}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Tags row */}
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#F5F5F5]">
                            {r.can != null && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                Độ cận: {r.can} độ
                              </span>
                            )}
                            {r.vien && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                                Viễn thị
                              </span>
                            )}
                            {r.loan && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                                Loạn thị
                              </span>
                            )}
                            {!r.can && !r.vien && !r.loan && (
                              <span className="text-xs text-[#9CA3AF]">
                                Không có chỉ định đặc biệt
                              </span>
                            )}
                          </div>

                          {r.note && (
                            <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex gap-2">
                              <FileText className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-0.5" />
                              <p className="text-sm text-[#6B7280] italic leading-relaxed">
                                {r.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
