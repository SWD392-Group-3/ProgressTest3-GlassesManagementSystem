"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import { getMyOrders, OrderDto } from "@/lib/api/order";
import { getEyeResultsByOrder, EyeResultDto } from "@/lib/api/eye-result";
import {
  Eye,
  Loader2,
  ArrowLeft,
  FileText,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Stethoscope,
} from "lucide-react";

interface EyeFields {
  sph: string;
  cyl: string;
  axis: string;
}

function parseEyeString(str: string | null | undefined): EyeFields {
  if (!str) return { sph: "", cyl: "", axis: "" };
  const get = (key: string) => {
    const m = str.match(new RegExp(`${key}:\\s*([\\d.+-]+)`));
    return m ? m[1] : "";
  };
  return { sph: get("S"), cyl: get("C"), axis: get("A") };
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending: {
    label: "Chờ xử lý",
    color: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  },
  Confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  Paid: {
    label: "Đã thanh toán",
    color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  Shipped: {
    label: "Đang giao",
    color: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  },
  Delivered: {
    label: "Đã giao",
    color: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  },
  Completed: {
    label: "Hoàn thành",
    color: "bg-green-50 text-green-700 ring-1 ring-green-200",
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
};

interface OrderWithResults {
  order: OrderDto;
  results: EyeResultDto[];
}

export default function CustomerEyeResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<OrderWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Customer") {
      router.replace("/");
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const orders = await getMyOrders();
        const serviceOrders = orders.filter((o) =>
          o.orderItems?.some((i) => i.serviceId != null),
        );

        const withResults = await Promise.all(
          serviceOrders.map(async (order) => {
            try {
              const results = await getEyeResultsByOrder(order.id);
              return { order, results };
            } catch {
              return { order, results: [] };
            }
          }),
        );

        const withActualResults = withResults.filter(
          (r) => r.results.length > 0,
        );

        withActualResults.sort(
          (a, b) =>
            new Date(b.order.orderDate).getTime() -
            new Date(a.order.orderDate).getTime(),
        );

        setData(withActualResults);
        if (withActualResults.length > 0) {
          setExpandedId(withActualResults[0].order.id);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const totalResults = data.reduce((sum, d) => sum + d.results.length, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[#F8F7F4] to-[#F9F9F9] pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back link */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#D4AF37] transition-colors mb-7 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Đơn hàng của tôi
          </Link>

          {/* Page header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37] flex items-center justify-center shadow-sm shadow-[#D4AF37]/30">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
                  Kết quả khám mắt
                </h1>
              </div>
              {!loading && !error && (
                <p className="text-sm text-[#9CA3AF] pl-0.5">
                  {totalResults > 0
                    ? `${totalResults} kết quả · ${data.length} đơn hàng`
                    : "Chưa có kết quả nào"}
                </p>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
              <p className="text-sm text-[#9CA3AF]">Đang tải kết quả...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-[#D4AF37]/8 flex items-center justify-center">
                  <Eye className="w-9 h-9 text-[#D4AF37]/30" />
                </div>
              </div>
              <p className="text-base font-semibold text-[#1A1A1A] mb-1">
                Chưa có kết quả khám mắt
              </p>
              <p className="text-sm text-[#9CA3AF] max-w-[260px] leading-relaxed mb-6">
                Sau khi nhân viên ghi kết quả, dữ liệu sẽ xuất hiện tại đây.
              </p>
              <Link
                href="/services"
                className="px-5 py-2.5 bg-[#D4AF37] text-white text-sm font-semibold rounded-xl hover:bg-[#C9A030] transition-colors shadow-sm shadow-[#D4AF37]/30"
              >
                Đặt dịch vụ khám mắt
              </Link>
            </div>
          )}

          {/* Order accordion list */}
          {!loading && !error && data.length > 0 && (
            <div className="space-y-4">
              {data.map(({ order, results }, idx) => {
                const isOpen = expandedId === order.id;
                const status = STATUS_MAP[order.status] ?? {
                  label: order.status,
                  color: "bg-gray-100 text-gray-600",
                };
                const serviceCount =
                  order.orderItems?.filter((i) => i.serviceId != null).length ??
                  0;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-[#D4AF37]/40 shadow-md shadow-[#D4AF37]/8"
                        : "border-[#E5E7EB] shadow-sm hover:border-[#D4AF37]/30 hover:shadow"
                    } bg-white`}
                  >
                    {/* ── Order summary row (clickable) ── */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : order.id)}
                      className="w-full text-left"
                    >
                      <div className="px-5 pt-4 pb-4 flex items-start gap-4">
                        {/* Index badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                            isOpen
                              ? "bg-[#D4AF37] text-white shadow-sm shadow-[#D4AF37]/40"
                              : "bg-[#F5F5F5] text-[#9CA3AF]"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        {/* Order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#1A1A1A] text-sm font-mono tracking-wide">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                              <Calendar className="w-3 h-3" />
                              {fmtDate(order.orderDate)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                              <Eye className="w-3 h-3" />
                              {serviceCount} dịch vụ · {results.length} kết quả
                            </span>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/orders/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#9CA3AF] hover:text-[#D4AF37] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/5"
                          >
                            Đơn hàng
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              isOpen ? "bg-[#D4AF37]/10" : "bg-[#F5F5F5]"
                            }`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-300 ${
                                isOpen
                                  ? "rotate-180 text-[#D4AF37]"
                                  : "text-[#9CA3AF]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* ── Expanded results ── */}
                    {isOpen && (
                      <div className="border-t border-[#F5F5F5]">
                        {/* Mobile order link */}
                        <div className="sm:hidden px-5 py-2.5 bg-[#FAFAFA] border-b border-[#F5F5F5]">
                          <Link
                            href={`/orders/${order.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#D4AF37] transition-colors"
                          >
                            Xem chi tiết đơn hàng
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        {results.map((r, rIdx) => {
                          const L = parseEyeString(r.eyeLeft);
                          const R = parseEyeString(r.eyeRight);
                          const hasExtra = r.can != null || r.vien || r.loan;

                          return (
                            <div
                              key={r.id}
                              className={
                                rIdx > 0 ? "border-t border-[#F5F5F5]" : ""
                              }
                            >
                              {/* Result header */}
                              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  </div>
                                  <span className="text-xs font-semibold text-[#374151]">
                                    Lần khám {rIdx + 1}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                                  <User className="w-3 h-3" />
                                  {r.staffName ?? "—"}
                                </span>
                              </div>

                              {/* Prescription card */}
                              <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-[#F0F0F0]">
                                {/* Column headers */}
                                <div className="grid grid-cols-4 bg-[#FAFAFA] border-b border-[#F0F0F0]">
                                  <div className="px-4 py-2.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                                    Mắt
                                  </div>
                                  {[
                                    { abbr: "SPH", name: "Độ cầu" },
                                    { abbr: "CYL", name: "Độ trụ" },
                                    { abbr: "AXIS", name: "Trục" },
                                  ].map((col) => (
                                    <div
                                      key={col.abbr}
                                      className="px-2 py-2.5 text-center"
                                    >
                                      <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                                        {col.abbr}
                                      </div>
                                      <div className="text-[9px] text-[#9CA3AF] mt-0.5">
                                        {col.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Left eye */}
                                <div className="grid grid-cols-4 border-b border-[#F0F0F0] hover:bg-blue-50/30 transition-colors">
                                  <div className="px-4 py-3.5 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                                      L
                                    </span>
                                    <span className="text-xs font-semibold text-[#374151]">
                                      Trái
                                    </span>
                                    <span className="text-[10px] text-[#9CA3AF] hidden sm:block">
                                      (OS)
                                    </span>
                                  </div>
                                  <div className="px-2 py-3.5 text-center font-mono text-sm font-bold text-[#1A1A1A]">
                                    {L.sph || (
                                      <span className="text-[#D1D5DB] font-normal">
                                        —
                                      </span>
                                    )}
                                  </div>
                                  <div className="px-2 py-3.5 text-center font-mono text-sm font-bold text-[#1A1A1A]">
                                    {L.cyl || (
                                      <span className="text-[#D1D5DB] font-normal">
                                        —
                                      </span>
                                    )}
                                  </div>
                                  <div className="px-2 py-3.5 text-center font-mono text-sm font-bold text-[#1A1A1A]">
                                    {L.axis ? (
                                      `${L.axis}°`
                                    ) : (
                                      <span className="text-[#D1D5DB] font-normal">
                                        —
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right eye */}
                                <div className="grid grid-cols-4 hover:bg-emerald-50/30 transition-colors">
                                  <div className="px-4 py-3.5 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                                      R
                                    </span>
                                    <span className="text-xs font-semibold text-[#374151]">
                                      Phải
                                    </span>
                                    <span className="text-[10px] text-[#9CA3AF] hidden sm:block">
                                      (OD)
                                    </span>
                                  </div>
                                  <div className="px-2 py-3.5 text-center font-mono text-sm font-bold text-[#1A1A1A]">
                                    {R.sph || (
                                      <span className="text-[#D1D5DB] font-normal">
                                        —
                                      </span>
                                    )}
                                  </div>
                                  <div className="px-2 py-3.5 text-center font-mono text-sm font-bold text-[#1A1A1A]">
                                    {R.cyl || (
                                      <span className="text-[#D1D5DB] font-normal">
                                        —
                                      </span>
                                    )}
                                  </div>
                                  <div className="px-2 py-3.5 text-center font-mono text-sm font-bold text-[#1A1A1A]">
                                    {R.axis ? (
                                      `${R.axis}°`
                                    ) : (
                                      <span className="text-[#D1D5DB] font-normal">
                                        —
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Tags + Note */}
                              {(hasExtra || r.note) && (
                                <div className="px-5 pb-5 space-y-3">
                                  {hasExtra && (
                                    <div className="flex flex-wrap gap-2">
                                      {r.can != null && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full ring-1 ring-blue-100">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                          Độ cận: {r.can} độ
                                        </span>
                                      )}
                                      {r.vien && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full ring-1 ring-amber-100">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                          Viễn thị
                                        </span>
                                      )}
                                      {r.loan && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full ring-1 ring-purple-100">
                                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                          Loạn thị
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {r.note && (
                                    <div className="flex gap-2.5 p-3.5 bg-[#F9FAFB] rounded-xl border border-[#F0F0F0]">
                                      <FileText className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-0.5" />
                                      <p className="text-sm text-[#6B7280] italic leading-relaxed">
                                        {r.note}
                                      </p>
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
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
