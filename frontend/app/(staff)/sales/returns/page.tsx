"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  X,
} from "lucide-react";
import { getUser } from "@/lib/auth-storage";
import { apiRequest, API } from "@/lib/api/client";

// ─── Types (aligned with backend ReturnExchangeResponse) ──────────────────────
interface ReturnExchangeImage {
  id: string;
  imageUrl: string;
  uploadedByRole: string;
  uploadedAt: string;
  description: string | null;
}

interface ReturnExchangeItem {
  id: string;
  orderItemId: string;
  quantity: number;
  reason: string | null;
  status: string;
  note: string | null;
  inspectionResult: string | null;
  createdAt: string;
  images: ReturnExchangeImage[];
}

interface ReturnExchange {
  id: string;
  orderId: string;
  customerId: string;
  reason: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  reviewedBySalesAt: string | null;
  receivedByOperationAt: string | null;
  resolvedAt: string | null;
  items: ReturnExchangeItem[];
  histories: {
    id: string;
    action: string;
    oldStatus: string | null;
    newStatus: string | null;
    comment: string | null;
    performedByRole: string;
    performedAt: string;
  }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xét duyệt",
  ApprovedBySales: "Đã phê duyệt",
  ReceivedByOperation: "Đã nhận hàng",
  Rejected: "Từ chối",
  Completed: "Hoàn tất",
};

const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  ApprovedBySales: "bg-blue-100 text-blue-800",
  ReceivedByOperation: "bg-purple-100 text-purple-800",
  Rejected: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const INSPECTION_OPTIONS = [
  { value: "Available", label: "Bình thường" },
  { value: "Defective", label: "Lỗi sản phẩm" },
  { value: "Damaged", label: "Hư hỏng" },
  { value: "NeedRepair", label: "Cần sửa chữa" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SalesReturnsPage() {
  const router = useRouter();
  const user = getUser();
  const isSales = user?.role === "Sales";
  const isOperation = user?.role === "Operation";

  const [returns, setReturns] = useState<ReturnExchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Expanded row id
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sales review form state
  const [reviewForm, setReviewForm] = useState<{
    comment: string;
    rejectionReason: string;
    submitting: boolean;
    error: string | null;
  }>({ comment: "", rejectionReason: "", submitting: false, error: null });

  // Operation receive form: comment + per-item fields
  const [receiveForm, setReceiveForm] = useState<{
    comment: string;
    submitting: boolean;
    error: string | null;
    items: Record<
      string,
      { status: string; note: string; inspectionResult: string }
    >;
  }>({ comment: "", submitting: false, error: null, items: {} });

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const endpoint = isSales
        ? API.returnExchange.getPending
        : API.returnExchange.getApproved;
      const data = await apiRequest<ReturnExchange[]>(
        endpoint,
        { method: "GET" },
        { auth: true },
      );
      setReturns(data || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [isSales]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isSales && !isOperation) {
      router.push("/");
      return;
    }
    fetchReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Tránh phụ thuộc `user` (getUser() trả về object mới mỗi render → gây fetch liên tục). Chỉ cần userId + role.
  }, [router, user?.userId, isSales, isOperation, fetchReturns]);

  function toggleExpand(re: ReturnExchange) {
    if (expandedId === re.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(re.id);
    setReviewForm({
      comment: "",
      rejectionReason: "",
      submitting: false,
      error: null,
    });
    if (isOperation) {
      const items: Record<
        string,
        { status: string; note: string; inspectionResult: string }
      > = {};
      re.items.forEach((i) => {
        items[i.id] = {
          status: "Received",
          note: "",
          inspectionResult: "Available",
        };
      });
      setReceiveForm({ comment: "", submitting: false, error: null, items });
    }
  }

  async function handleReview(isApproved: boolean) {
    const re = returns.find((r) => r.id === expandedId);
    if (!re) return;
    setReviewForm((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await apiRequest(
        API.returnExchange.review,
        {
          method: "POST",
          body: JSON.stringify({
            returnExchangeId: re.id,
            isApproved,
            comment: reviewForm.comment || undefined,
            rejectionReason: !isApproved
              ? reviewForm.rejectionReason || undefined
              : undefined,
          }),
        },
        { auth: true },
      );
      setSuccess(
        isApproved
          ? "Đã phê duyệt yêu cầu đổi trả."
          : "Đã từ chối yêu cầu đổi trả.",
      );
      setExpandedId(null);
      fetchReturns();
    } catch (e) {
      setReviewForm((prev) => ({
        ...prev,
        submitting: false,
        error: (e as Error).message,
      }));
    }
  }

  async function handleReceive() {
    const re = returns.find((r) => r.id === expandedId);
    if (!re) return;
    setReceiveForm((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await apiRequest(
        API.returnExchange.receive,
        {
          method: "POST",
          body: JSON.stringify({
            returnExchangeId: re.id,
            comment: receiveForm.comment || undefined,
            items: Object.entries(receiveForm.items).map(([id, v]) => ({
              returnExchangeItemId: id,
              status: v.status,
              note: v.note || undefined,
              inspectionResult: v.inspectionResult || undefined,
            })),
          }),
        },
        { auth: true },
      );
      setSuccess("Đã xác nhận nhận hàng hoàn trả.");
      setExpandedId(null);
      fetchReturns();
    } catch (e) {
      setReceiveForm((prev) => ({
        ...prev,
        submitting: false,
        error: (e as Error).message,
      }));
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
            Nhân viên
          </span>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mt-1">
            Đổi trả hàng
          </h1>
          <p className="text-[#6B7280] mt-1 text-sm">
            {isSales
              ? "Xem xét và phê duyệt / từ chối yêu cầu đổi trả từ khách hàng."
              : "Nhận hàng hoàn và kiểm tra tình trạng sản phẩm."}
          </p>
        </div>
        <button
          onClick={fetchReturns}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm font-semibold hover:bg-[#C9A030] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && returns.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#6B7280] font-medium">
            {isSales
              ? "Không có yêu cầu đổi trả nào đang chờ xét duyệt."
              : "Không có yêu cầu đổi trả nào đang chờ nhận hàng."}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && returns.length > 0 && (
        <div className="space-y-4">
          {returns.map((re) => {
            const isExpanded = expandedId === re.id;
            return (
              <div
                key={re.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm"
              >
                {/* Row Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(re)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A1A1A] text-sm font-mono">
                        #{re.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Đơn:{" "}
                        <span className="font-mono">
                          {re.orderId.slice(0, 8).toUpperCase()}
                        </span>{" "}
                        · {fmtDate(re.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[re.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {STATUS_LABEL[re.status] ?? re.status}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {re.items.length} sp
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expandable Detail */}
                {isExpanded && (
                  <div className="border-t border-[#E5E7EB] px-5 py-5 space-y-5">
                    {/* Reason */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                        Lý do yêu cầu
                      </p>
                      <p className="text-sm text-[#1A1A1A]">
                        {re.reason || "—"}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                        Sản phẩm hoàn trả
                      </p>
                      <div className="space-y-3">
                        {re.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#6B7280] font-mono">
                                Item #
                                {item.orderItemId.slice(0, 8).toUpperCase()}
                              </span>
                              <span className="text-xs font-semibold text-[#1A1A1A]">
                                SL: {item.quantity}
                              </span>
                            </div>
                            {item.reason && (
                              <p className="text-xs text-[#4B5563]">
                                Lý do: {item.reason}
                              </p>
                            )}
                            {item.images.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {item.images.map((img) => (
                                  <a
                                    key={img.id}
                                    href={img.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={img.imageUrl}
                                      alt="Ảnh đổi trả"
                                      className="w-14 h-14 object-cover rounded-lg border border-[#E5E7EB] hover:opacity-80 transition-opacity"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Operation: per-item receive form */}
                            {isOperation && receiveForm.items[item.id] && (
                              <div className="mt-2 space-y-2 border-t pt-2 border-dashed border-[#E5E7EB]">
                                <div className="flex flex-wrap gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                                      Trạng thái nhận
                                    </label>
                                    <select
                                      aria-label="Trạng thái nhận"
                                      value={receiveForm.items[item.id].status}
                                      onChange={(e) =>
                                        setReceiveForm((prev) => ({
                                          ...prev,
                                          items: {
                                            ...prev.items,
                                            [item.id]: {
                                              ...prev.items[item.id],
                                              status: e.target.value,
                                            },
                                          },
                                        }))
                                      }
                                      className="h-8 px-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] outline-none"
                                    >
                                      <option value="Received">Đã nhận</option>
                                      <option value="Rejected">
                                        Từ chối nhận
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                                      Kết quả kiểm tra
                                    </label>
                                    <select
                                      aria-label="Kết quả kiểm tra"
                                      value={
                                        receiveForm.items[item.id]
                                          .inspectionResult
                                      }
                                      onChange={(e) =>
                                        setReceiveForm((prev) => ({
                                          ...prev,
                                          items: {
                                            ...prev.items,
                                            [item.id]: {
                                              ...prev.items[item.id],
                                              inspectionResult: e.target.value,
                                            },
                                          },
                                        }))
                                      }
                                      className="h-8 px-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] outline-none"
                                    >
                                      {INSPECTION_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                          {o.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Ghi chú cho sản phẩm này..."
                                  value={receiveForm.items[item.id].note}
                                  onChange={(e) =>
                                    setReceiveForm((prev) => ({
                                      ...prev,
                                      items: {
                                        ...prev.items,
                                        [item.id]: {
                                          ...prev.items[item.id],
                                          note: e.target.value,
                                        },
                                      },
                                    }))
                                  }
                                  className="w-full h-8 px-3 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] outline-none"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sales: Review form */}
                    {isSales && (
                      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                          Xét duyệt yêu cầu
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Nhận xét (tuỳ chọn)..."
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          className="w-full p-3 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none"
                        />
                        <input
                          type="text"
                          placeholder="Lý do từ chối (điền nếu từ chối)..."
                          value={reviewForm.rejectionReason}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rejectionReason: e.target.value,
                            }))
                          }
                          className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] outline-none"
                        />
                        {reviewForm.error && (
                          <p className="text-xs text-red-600">
                            {reviewForm.error}
                          </p>
                        )}
                        <div className="flex gap-3">
                          <button
                            disabled={reviewForm.submitting}
                            onClick={() => handleReview(true)}
                            className="flex-1 h-10 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {reviewForm.submitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Phê duyệt
                          </button>
                          <button
                            disabled={reviewForm.submitting}
                            onClick={() => handleReview(false)}
                            className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            {reviewForm.submitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Từ chối
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Operation: Receive form */}
                    {isOperation && (
                      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                          Xác nhận nhận hàng
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Ghi chú chung (tuỳ chọn)..."
                          value={receiveForm.comment}
                          onChange={(e) =>
                            setReceiveForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          className="w-full p-3 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none"
                        />
                        {receiveForm.error && (
                          <p className="text-xs text-red-600">
                            {receiveForm.error}
                          </p>
                        )}
                        <button
                          disabled={receiveForm.submitting}
                          onClick={handleReceive}
                          className="w-full h-10 rounded-xl bg-[#D4AF37] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#C9A030] disabled:opacity-50 transition-colors"
                        >
                          {receiveForm.submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                          Xác nhận đã nhận hàng
                        </button>
                      </div>
                    )}

                    {/* History */}
                    {re.histories.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                          Lịch sử xử lý
                        </p>
                        <div className="space-y-2">
                          {re.histories.map((h) => (
                            <div
                              key={h.id}
                              className="flex items-start gap-2 text-xs text-[#6B7280]"
                            >
                              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>
                                <strong className="text-[#4B5563]">
                                  {h.action}
                                </strong>
                                {h.oldStatus && h.newStatus && (
                                  <span>
                                    {" "}
                                    · {h.oldStatus} → {h.newStatus}
                                  </span>
                                )}
                                {h.comment && <span> · {h.comment}</span>}
                                <span className="ml-1 text-[#9CA3AF]">
                                  ({fmtDate(h.performedAt)} ·{" "}
                                  {h.performedByRole})
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
