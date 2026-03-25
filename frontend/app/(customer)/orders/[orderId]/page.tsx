"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  XCircle,
  Clock,
  Truck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import {
  getOrderById,
  cancelOrder,
  completeOrder,
  createMomoPayment,
  OrderDto,
  orderHasReturnEligibleItems,
} from "@/lib/api";
import { useNotifications } from "@/lib/NotificationContext";
import { checkCanFeedback } from "@/lib/api/feedback";
import FeedbackModal from "@/components/FeedbackModal";

function fmt(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STEPS = [
  "Pending",
  "Paid",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Completed",
];

const STATUS_LABEL: Record<string, string> = {
  Pending: "Pending Confirmation",
  Paid: "Paid",
  Confirmed: "Confirmed",
  Shipped: "Shipping",
  Delivered: "Delivered",
  Completed: "Completed",
  Cancelled: "Cancelled",
  PartiallyReturned: "Partial return done",
  Returned: "Return / exchange closed",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-4 h-4" />,
  Paid: <CheckCircle2 className="w-4 h-4" />,
  Confirmed: <RefreshCw className="w-4 h-4" />,
  Shipped: <Truck className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
  Completed: <CheckCircle2 className="w-4 h-4" />,
  Cancelled: <XCircle className="w-4 h-4" />,
  PartiallyReturned: <RefreshCw className="w-4 h-4" />,
  Returned: <Package className="w-4 h-4" />,
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment"); // "success" | "failed" | null

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { notifications } = useNotifications();

  // Feedback State
  const [feedbackItem, setFeedbackItem] = useState<{
    productId: string;
    orderItemId: string;
    productName: string;
  } | null>(null);
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);

      // Fetch which items can be reviewed if status is Delivered/Completed
      if (
        data.status === "Delivered" ||
        data.status === "Completed" ||
        data.status === "PartiallyReturned"
      ) {
        const canReviewMap = await Promise.all(
          (data.orderItems ?? []).map(async (item) => {
            try {
              const res = await checkCanFeedback(item.id);
              return { id: item.id, canReview: res.canFeedback };
            } catch {
              return { id: item.id, canReview: false };
            }
          }),
        );
        const newReviewedSets = new Set<string>();
        // If canReview is false, it means they already reviewed
        canReviewMap.forEach((m) => {
          if (!m.canReview) {
            newReviewedSets.add(m.id);
          }
        });
        setReviewedItems(newReviewedSets);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Re-fetch after MoMo redirects back so status reflects payment result
  useEffect(() => {
    if (paymentStatus === "success" || paymentStatus === "failed") {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  // Update order status in real-time when receiving SignalR notifications
  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    if (latest.orderId === orderId && latest.newStatus) {
      setOrder((prev) =>
        prev ? { ...prev, status: latest.newStatus! } : prev,
      );
    }
  }, [notifications, orderId]);

  async function handlePayMomo() {
    if (!order) return;
    setPayLoading(true);
    try {
      const resp = await createMomoPayment(
        order.id,
        Math.round(order.finalAmount ?? order.totalAmount),
        `Payment for order #${(order.id ?? "").slice(0, 8).toUpperCase()}`,
      );
      if (resp.payUrl) {
        window.location.href = resp.payUrl;
      } else {
        alert("Unable to create MoMo payment link.");
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPayLoading(false);
    }
  }

  async function handleCancel() {
    if (!order || !confirm("Are you sure you want to cancel this order?"))
      return;
    setCancelLoading(true);
    try {
      await cancelOrder(order.id);
      setOrder({ ...order, status: "Cancelled" });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleComplete() {
    if (!order) return;
    const isService =
      (order.shippingAddress == null || order.shippingAddress === "") &&
      (order.shippingPhone == null || order.shippingPhone === "");
    const msg = isService
      ? "Confirm that you have completed the service?\nAfter confirmation, the order will move to Completed."
      : "Confirm that you have received this order?\nAfter confirmation, you can request return/exchange if needed.";
    if (!confirm(msg)) return;
    setCompleteLoading(true);
    try {
      await completeOrder(order.id);
      setOrder({ ...order, status: "Completed" });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCompleteLoading(false);
    }
  }

  const canCancel = order?.status === "Pending";
  const canPay = order?.status === "Pending" && order?.paymentStatus !== "Paid";
  const canComplete = order?.status === "Delivered";
  const canReturn =
    !!order &&
    order.status !== "Returned" &&
    orderHasReturnEligibleItems(order) &&
    (order.status === "Completed" ||
      order.status === "Delivered" ||
      order.status === "PartiallyReturned");
  const canReview =
    order?.status === "Completed" ||
    order?.status === "Delivered" ||
    order?.status === "PartiallyReturned";
  const isCancelled = order?.status === "Cancelled";
  const isReturned = order?.status === "Returned";
  const isPartiallyReturned = order?.status === "PartiallyReturned";
  const currentStepIndex = isCancelled
    ? -1
    : isReturned
      ? -1
      : isPartiallyReturned
        ? STATUS_STEPS.length - 1
        : STATUS_STEPS.indexOf(order?.status ?? "");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Payment result banner */}
          {paymentStatus === "success" && (
            <div className="flex items-center gap-3 mb-6 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-sm font-semibold text-green-700">
                Payment successful! Your order is being processed.
              </p>
            </div>
          )}
          {paymentStatus === "failed" && (
            <div className="flex items-center gap-3 mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">
                Payment failed or was cancelled. You can try again below.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Link
              href="/orders"
              className="p-2 rounded-full hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
                Order Details
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-heading">
                #{orderId?.slice(0, 8).toUpperCase()}
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchOrder}
                className="text-[#D4AF37] hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Progress / Status */}
              {isReturned ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-800">
                    Return or exchange for this order is complete. This order is
                    closed for new return or exchange requests.
                  </p>
                </div>
              ) : null}
              {!isCancelled && !isReturned ? (
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
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
                                  : "bg-[#E5E7EB]"
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              done
                                ? "bg-[#D4AF37] text-white"
                                : "bg-[#F5F5F5] text-[#9CA3AF]"
                            } ${active ? "ring-4 ring-[#D4AF37]/20" : ""}`}
                          >
                            {STATUS_ICON[step]}
                          </div>
                          <p
                            className={`text-[10px] font-semibold mt-2 text-center leading-tight ${
                              done ? "text-[#D4AF37]" : "text-[#9CA3AF]"
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
                <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-600">
                    Order has been cancelled
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping info */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                  <h2 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    Shipping Information
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                      <span className="text-[#1A1A1A]">
                        {order.shippingAddress}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#6B7280] shrink-0" />
                      <span className="text-[#1A1A1A]">
                        {order.shippingPhone}
                      </span>
                    </div>
                    {order.note && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                        <span className="text-[#6B7280] italic">
                          {order.note}
                        </span>
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

                {/* Price summary */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                  <h2 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    Payment Summary
                  </h2>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Subtotal</span>
                      <span className="text-[#1A1A1A]">
                        {fmt(order.totalAmount)}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Discount</span>
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

              {/* Order items */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#D4AF37]" />
                    Items ({(order.orderItems ?? []).length})
                  </h2>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {(order.orderItems ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Product image */}
                        <div className="w-14 h-14 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden border border-[#E5E7EB]">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName ?? "Product"}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-[#D4AF37]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">
                            {item.productName ??
                              (item.productVariantId
                                ? "Frame"
                                : item.lensesVariantId
                                  ? "Lens"
                                  : item.comboItemId
                                    ? "Combo"
                                    : "Service")}
                          </p>
                          {(() => {
                            const rawId =
                              item.productVariantId ??
                              item.lensesVariantId ??
                              item.comboItemId ??
                              item.serviceId;
                            return rawId ? (
                              <p className="text-xs text-[#6B7280]">
                                #{rawId.slice(0, 8).toUpperCase()}
                              </p>
                            ) : null;
                          })()}
                          {item.note && (
                            <p className="text-xs text-[#9CA3AF] italic">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        <div>
                          <p className="text-xs text-[#6B7280]">
                            {fmt(item.unitPrice)} × {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-[#1A1A1A]">
                            {fmt(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                        {canReview && item.productId && (
                          <button
                            onClick={() => {
                              if (reviewedItems.has(item.id)) return;
                              setFeedbackItem({
                                productId: item.productId!,
                                orderItemId: item.id,
                                productName: item.productName || "Product",
                              });
                            }}
                            disabled={reviewedItems.has(item.id)}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                              reviewedItems.has(item.id)
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                                : "text-[#D4AF37] border border-[#D4AF37] hover:bg-yellow-50"
                            }`}
                          >
                            {reviewedItems.has(item.id)
                              ? "Reviewed"
                              : "Write a review"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canPay && (
                  <button
                    onClick={handlePayMomo}
                    disabled={payLoading}
                    className="flex-1 h-12 rounded-full bg-[#D4AF37] text-white font-semibold text-sm hover:bg-[#C9A030] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {payLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay with MoMo
                      </>
                    )}
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="flex-1 h-12 rounded-full border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
                {canComplete && (
                  <button
                    onClick={handleComplete}
                    disabled={completeLoading}
                    className="flex-1 h-12 rounded-full bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {completeLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                )}
                {canReturn && (
                  <Link
                    href={`/orders/${order.id}/return`}
                    className="flex-1 h-12 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] font-semibold text-sm hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Request Return / Exchange
                  </Link>
                )}
              </div>
            </div>
          ) : null}

          {/* Feedback Modal */}
          {feedbackItem && (
            <FeedbackModal
              isOpen={!!feedbackItem}
              productId={feedbackItem.productId}
              orderItemId={feedbackItem.orderItemId}
              productName={feedbackItem.productName}
              onClose={() => setFeedbackItem(null)}
              onSuccess={() => {
                // Mark this item as reviewed so button updates immediately
                setReviewedItems((prev) =>
                  new Set(prev).add(feedbackItem.orderItemId),
                );
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
