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
  Images,
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
  images?: ReturnExchangeImage[] | null;
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
  Pending: "Pending",
  ApprovedBySales: "Approved",
  ReceivedByOperation: "Received",
  Rejected: "Rejected",
  Completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  ApprovedBySales: "bg-blue-100 text-blue-800",
  ReceivedByOperation: "bg-purple-100 text-purple-800",
  Rejected: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const INSPECTION_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "Defective", label: "Defective" },
  { value: "Damaged", label: "Damaged" },
  { value: "NeedRepair", label: "Need repair" },
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

function ItemEvidencePhotos({ images }: { images: ReturnExchangeImage[] }) {
  if (images.length === 0) {
    return (
      <p className="text-xs text-[#9CA3AF] mt-2">
        Không có ảnh đính kèm · No photos uploaded
      </p>
    );
  }
  return (
    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
      <div className="flex items-center gap-2 mb-2">
        <Images className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
          Ảnh sản phẩm bị hỏng · Evidence photos
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <a
            key={img.id}
            href={img.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block shrink-0 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm ring-0 transition-all hover:ring-2 hover:ring-[#D4AF37]/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt="Ảnh minh chứng lỗi sản phẩm"
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover"
            />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-[#9CA3AF] mt-2">
        Bấm ảnh để xem kích thước đầy đủ
      </p>
    </div>
  );
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
        isApproved ? "Return request approved." : "Return request rejected.",
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
      setSuccess("Return received and confirmed.");
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
            Staff
          </span>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mt-1">
            Returns & exchanges
          </h1>
          <p className="text-[#6B7280] mt-1 text-sm">
            {isSales
              ? "Review and approve or reject return requests from customers."
              : "Receive returned items and inspect product condition."}
          </p>
        </div>
        <button
          onClick={fetchReturns}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm font-semibold hover:bg-[#C9A030] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
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
              ? "No return requests pending review."
              : "No return requests pending receipt."}
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
                        Order:{" "}
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
                      {re.items.length} item{re.items.length !== 1 ? "s" : ""}
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
                        Reason for request
                      </p>
                      <p className="text-sm text-[#1A1A1A]">
                        {re.reason || "—"}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                        Returned items
                      </p>
                      <div className="space-y-3">
                        {re.items.map((item) => {
                          const evidencePhotos = item.images ?? [];
                          return (
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
                                Reason: {item.reason}
                              </p>
                            )}
                            <ItemEvidencePhotos images={evidencePhotos} />

                            {/* Operation: per-item receive form */}
                            {isOperation && receiveForm.items[item.id] && (
                              <div className="mt-2 space-y-2 border-t pt-2 border-dashed border-[#E5E7EB]">
                                <div className="flex flex-wrap gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                                      Receive status
                                    </label>
                                    <select
                                      aria-label="Receive status"
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
                                      <option value="Received">Received</option>
                                      <option value="Rejected">
                                        Reject receive
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                                      Inspection result
                                    </label>
                                    <select
                                      aria-label="Inspection result"
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
                                  placeholder="Note for this item..."
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
                          );
                        })}
                      </div>
                    </div>

                    {/* Sales: Review form */}
                    {isSales && (
                      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                          Review request
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Comment (optional)..."
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
                          placeholder="Rejection reason (if rejecting)..."
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
                            Approve
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
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Operation: Receive form */}
                    {isOperation && (
                      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                          Confirm receipt
                        </p>
                        <textarea
                          rows={2}
                          placeholder="General note (optional)..."
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
                          Confirm received
                        </button>
                      </div>
                    )}

                    {/* History */}
                    {re.histories.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                          Processing history
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
