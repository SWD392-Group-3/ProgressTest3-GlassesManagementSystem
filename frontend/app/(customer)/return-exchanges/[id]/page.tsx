"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Package,
  History,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import {
  getReturnExchangeById,
  ReturnExchangeDto,
  ReturnExchangeItemDto,
  ReturnExchangeImageDto,
} from "@/lib/api/return-exchange";

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Pending Review",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  UnderReview: {
    label: "Under Review",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ApprovedBySales: {
    label: "Approved by Sales",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  ReceivedByOperation: {
    label: "Received at Warehouse",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-100",
    icon: <RefreshCcw className="w-3.5 h-3.5" />,
  },
  Completed: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Rejected: {
    label: "Rejected",
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

const ITEM_STATUS_LABEL: Record<string, string> = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Received: "Received",
};

const INSPECTION_LABEL: Record<string, string> = {
  Available: "Available",
  Defective: "Defective",
  Damaged: "Damaged",
  NeedRepair: "Need repair",
};

function itemImageUrls(item: ReturnExchangeItemDto): string[] {
  if (!item.images?.length) return [];
  const first = item.images[0];
  if (typeof first === "string") return item.images as string[];
  return (item.images as ReturnExchangeImageDto[]).map((i) => i.imageUrl);
}

function workflowStepIndex(status: string): number {
  switch (status) {
    case "Pending":
    case "UnderReview":
      return 0;
    case "ApprovedBySales":
      return 1;
    case "ReceivedByOperation":
      return 2;
    case "Completed":
      return 3;
    case "Rejected":
      return -1;
    default:
      return 0;
  }
}

const WORKFLOW_STEPS = [
  { title: "Submitted", desc: "Your request was received" },
  { title: "Sales review", desc: "Approval or rejection" },
  { title: "Warehouse", desc: "Items received & inspected" },
  { title: "Closed", desc: "Request completed" },
];

export default function ReturnExchangeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [req, setReq] = useState<ReturnExchangeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReturnExchangeById(id);
      setReq(data);
    } catch (e) {
      setError((e as Error).message);
      setReq(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchDetail();
  }, [fetchDetail, router]);

  const histories = useMemo(() => {
    const list = req?.histories ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime(),
    );
  }, [req?.histories]);

  const stepIdx = req ? workflowStepIndex(req.status) : 0;
  const isRejected = req?.status === "Rejected";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/return-exchanges")}
            className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to requests
          </button>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 text-center bg-white rounded-2xl border border-[#E5E7EB]">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-[#6B7280] mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchDetail}
                className="text-[#D4AF37] hover:underline font-medium text-sm"
              >
                Try again
              </button>
            </div>
          ) : req ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
                      Return / Exchange
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-2 font-heading">
                      Request status
                    </h1>
                    <p className="text-sm text-[#6B7280] mt-1 font-mono">
                      #{(req.id ?? "").slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href={`/orders/${req.orderId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F5] text-[#1A1A1A] font-medium hover:bg-[#ECECEC] transition-colors"
                  >
                    <Package className="w-4 h-4 text-[#D4AF37]" />
                    View order
                    <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                  </Link>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F5] text-[#6B7280]">
                    Type:{" "}
                    <span className="text-[#1A1A1A] font-medium">
                      {req.type === "Return"
                        ? "Return"
                        : req.type === "Exchange"
                          ? "Exchange"
                          : "Return / Exchange"}
                    </span>
                  </span>
                </div>

                {isRejected && req.rejectionReason ? (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <span className="font-semibold">Rejection reason: </span>
                    {req.rejectionReason}
                  </div>
                ) : null}

                <div className="mt-8">
                  <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">
                    Progress
                  </h2>
                  {isRejected ? (
                    <p className="text-sm text-red-600 mb-4">
                      This request was rejected during sales review.
                    </p>
                  ) : null}
                  <ol className="relative space-y-0">
                    {WORKFLOW_STEPS.map((step, i) => {
                      const done =
                        !isRejected && stepIdx >= 0 && i <= stepIdx;
                      const current =
                        !isRejected && stepIdx >= 0 && i === stepIdx;
                      return (
                        <li
                          key={step.title}
                          className="flex gap-4 pb-8 last:pb-0"
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 ${
                                done
                                  ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                                  : current
                                    ? "border-[#D4AF37] bg-white text-[#D4AF37]"
                                    : "border-[#E5E7EB] bg-white text-[#9CA3AF]"
                              }`}
                            >
                              {done ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                i + 1
                              )}
                            </span>
                            {i < WORKFLOW_STEPS.length - 1 ? (
                              <span
                                className={`w-0.5 flex-1 min-h-8 mt-1 ${
                                  done ? "bg-[#D4AF37]" : "bg-[#E5E7EB]"
                                }`}
                              />
                            ) : null}
                          </div>
                          <div className="pt-0.5">
                            <p
                              className={`font-semibold text-sm ${
                                done || current
                                  ? "text-[#1A1A1A]"
                                  : "text-[#9CA3AF]"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[#E5E7EB] pt-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                      Submitted
                    </p>
                    <p className="text-[#1A1A1A] font-medium">
                      {fmtDate(req.createdAt)}
                    </p>
                  </div>
                  {req.reviewedBySalesAt ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                        Sales decision
                      </p>
                      <p className="text-[#1A1A1A] font-medium">
                        {fmtDate(req.reviewedBySalesAt)}
                      </p>
                    </div>
                  ) : null}
                  {req.receivedByOperationAt ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                        Warehouse
                      </p>
                      <p className="text-[#1A1A1A] font-medium">
                        {fmtDate(req.receivedByOperationAt)}
                      </p>
                    </div>
                  ) : null}
                  {req.resolvedAt ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                        Resolved
                      </p>
                      <p className="text-[#1A1A1A] font-medium">
                        {fmtDate(req.resolvedAt)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {histories.length > 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-[#D4AF37]" />
                    <h2 className="text-lg font-bold text-[#1A1A1A] font-heading">
                      Activity
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    {histories.map((h) => (
                      <li
                        key={h.id}
                        className="flex gap-4 text-sm border-b border-[#F3F4F6] last:border-0 pb-4 last:pb-0"
                      >
                        <div className="shrink-0 w-28 text-xs text-[#9CA3AF]">
                          {fmtDate(h.performedAt)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1A1A1A]">
                            {h.action}
                            {h.newStatus ? (
                              <span className="font-normal text-[#6B7280]">
                                {" "}
                                → {h.newStatus}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-0.5">
                            {h.performedByRole}
                          </p>
                          {h.comment ? (
                            <p className="text-[#4B5563] mt-2 text-sm leading-relaxed">
                              {h.comment}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 font-heading">
                  Items
                </h2>
                <p className="text-sm text-[#6B7280] mb-6">
                  Overall reason:{" "}
                  <span className="text-[#1A1A1A]">{req.reason ?? "—"}</span>
                </p>
                <ul className="space-y-6">
                  {(req.items ?? []).map((item, idx) => {
                    const urls = itemImageUrls(item);
                    const itemLabel = ITEM_STATUS_LABEL[item.status] ?? item.status;
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[#E5E7EB] p-4 bg-[#FAFAFA]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="text-sm font-semibold text-[#1A1A1A]">
                            Item {idx + 1}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#374151]">
                            {itemLabel}
                          </span>
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                              Quantity
                            </dt>
                            <dd className="font-medium text-[#1A1A1A]">
                              {item.quantity}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                              Order line ID
                            </dt>
                            <dd className="font-mono text-xs text-[#374151] break-all">
                              {(item.orderItemId ?? "").slice(0, 8)}…
                            </dd>
                          </div>
                          {item.reason ? (
                            <div className="sm:col-span-2">
                              <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                                Reason
                              </dt>
                              <dd className="text-[#1A1A1A]">{item.reason}</dd>
                            </div>
                          ) : null}
                          {item.note ? (
                            <div className="sm:col-span-2">
                              <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                                Staff note
                              </dt>
                              <dd className="text-[#1A1A1A]">{item.note}</dd>
                            </div>
                          ) : null}
                          {item.inspectionResult ? (
                            <div>
                              <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                                Inspection
                              </dt>
                              <dd className="font-medium text-[#1A1A1A]">
                                {INSPECTION_LABEL[item.inspectionResult] ??
                                  item.inspectionResult}
                              </dd>
                            </div>
                          ) : null}
                        </dl>
                        {urls.length > 0 ? (
                          <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-wide text-[#6B7280] mb-2">
                              Photos
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {urls.map((url, uidx) => (
                                <a
                                  key={`${url}-${uidx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-20 h-20 rounded-lg overflow-hidden border border-[#E5E7EB] bg-white shrink-0"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
