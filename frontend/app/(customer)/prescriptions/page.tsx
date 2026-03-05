"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import { getMyPrescriptions, PrescriptionDto } from "@/lib/api/prescription";

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  Pending: {
    label: "Chờ duyệt",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  Confirmed: {
    label: "Đã duyệt",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Rejected: {
    label: "Từ chối",
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

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPrescriptions();
      setPrescriptions(data);
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
    fetchPrescriptions();
  }, [fetchPrescriptions, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
                Tài khoản
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2 font-heading">
                Hồ sơ đo mắt (Đơn kính)
              </h1>
            </div>
            <Link
              href="/prescriptions/new"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-[#1A1A1A] text-white font-semibold text-sm hover:bg-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo đơn mới
            </Link>
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
                onClick={fetchPrescriptions}
                className="text-[#D4AF37] hover:underline font-medium text-sm"
              >
                Thử lại
              </button>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <FileText className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3 font-heading">
                Chưa có hồ sơ đo mắt
              </h2>
              <p className="text-[#6B7280] mb-8">
                Bạn chưa lưu thông số kính cận/viễn nào để mua hàng.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Khởi tạo lúc</p>
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          {fmtDate(p.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Càng Kính
                      </h4>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.cangKinh || "Chưa nhập"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Bản Lề
                      </h4>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.banLe || "Chưa nhập"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Viền Gọng
                      </h4>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.vienGong || "Chưa nhập"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Chân Ve Mũi
                      </h4>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.chanVeMui || "Chưa nhập"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Cầu Gọng
                      </h4>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.cauGong || "Chưa nhập"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Đuôi Gọng
                      </h4>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.duoiGong || "Chưa nhập"}
                      </p>
                    </div>
                  </div>

                  {p.note && (
                    <div className="px-5 py-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">
                          Ghi chú:{" "}
                        </span>
                        {p.note}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end px-5 py-3 bg-[#F5F5F5] border-t border-[#E5E7EB]">
                    {p.status === "Pending" && (
                      <span className="text-xs text-amber-600 mr-auto flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Có thể chỉnh sửa
                      </span>
                    )}
                    <Link
                      href={`/prescriptions/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:text-[#C9A030] transition-colors"
                    >
                      {p.status === "Pending" ? "Chỉnh sửa" : "Xem chi tiết"}
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
