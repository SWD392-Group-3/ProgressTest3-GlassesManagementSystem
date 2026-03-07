"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RefreshCcw,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import {
  getMyReturnExchanges,
  ReturnExchangeDto,
} from "@/lib/api/return-exchange";

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Chờ xét duyệt",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ApprovedBySales: {
    label: "Đã duyệt",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  ReceivedByOperation: {
    label: "Đã nhận hàng",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-100",
    icon: <RefreshCcw className="w-3.5 h-3.5" />,
  },
  Completed: {
    label: "Hoàn tất",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Rejected: {
    label: "Bị từ chối",
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

export default function ReturnExchangesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReturnExchangeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyReturnExchanges();
      setRequests(data);
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
    fetchRequests();
  }, [fetchRequests, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
              Tài khoản
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2 font-heading">
              Yêu cầu hoàn trả / đổi hàng
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
                onClick={fetchRequests}
                className="text-[#D4AF37] hover:underline font-medium text-sm"
              >
                Thử lại
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <RefreshCcw className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3 font-heading">
                Chưa có yêu cầu nào
              </h2>
              <p className="text-[#6B7280] mb-8">
                Bạn chưa gửi yêu cầu trả hoặc đổi hàng nào.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                        <RefreshCcw className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Mã yêu cầu</p>
                        <p className="text-sm font-mono font-semibold text-[#1A1A1A]">
                          #{(req.id ?? "").slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Ngày tạo
                        </p>
                        <p className="text-[#1A1A1A] font-medium">
                          {fmtDate(req.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Loại yêu cầu
                        </p>
                        <p className="text-[#1A1A1A] font-medium">
                          {req.type === "Return" ? "Hoàn cứng" : "Đổi hàng"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Sản phẩm đổi/trả
                        </p>
                        <p className="text-[#1A1A1A] font-medium">
                          {(req.items ?? []).reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          items
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                          Dự kiến hoàn tiền
                        </p>
                        <p className="text-[#1A1A1A] font-bold">
                          {req.totalRefundAmount
                            ? fmt(req.totalRefundAmount)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-5 py-3 bg-[#F5F5F5] border-t border-[#E5E7EB]">
                    <p className="text-xs text-gray-500 font-medium truncate max-w-sm">
                      Lý do: {req.reason}
                    </p>
                    <Link
                      href={`/return-exchanges/${req.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:text-[#C9A030] transition-colors whitespace-nowrap"
                    >
                      Xem trạng thái
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
