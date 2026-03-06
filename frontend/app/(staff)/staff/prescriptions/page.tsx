"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAllPrescriptions,
  rejectPrescription,
  PrescriptionDto,
} from "@/lib/api/prescription";
import { getUser } from "@/lib/auth-storage";
import {
  Loader2,
  RefreshCw,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PrescriptionPending: {
    label: "Chờ duyệt",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PrescriptionConfirmed: {
    label: "Đã duyệt",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PrescriptionRejected: {
    label: "Từ chối",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
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

export default function StaffPrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPrescriptions();
      setPrescriptions(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách đơn",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "Staff" && user.role !== "Admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [router, fetchData]);

  const handleReject = async (id: string) => {
    try {
      await rejectPrescription(id, { reason: rejectReason || undefined });
      setRejectingId(null);
      setRejectReason("");
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi khi từ chối đơn");
    }
  };

  const filtered = prescriptions.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch =
      search === "" ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.note ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusFilters = [
    "all",
    "PrescriptionPending",
    "PrescriptionConfirmed",
    "PrescriptionRejected",
  ];

  return (
    <div className="p-2 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý đơn gọng kính
            </h1>
            <p className="text-gray-500 text-sm">
              Xem và xử lý yêu cầu thông số gọng kính từ khách hàng
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((status) => {
            const cfg = STATUS_MAP[status];
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filterStatus === status
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#D4AF37]"
                }`}
              >
                {status === "all" ? "Tất cả" : (cfg?.label ?? status)}
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-semibold hover:bg-[#C9A030] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
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

      {/* Table */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Không có đơn gọng kính nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Thông số gọng
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Ghi chú
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.map((p) => {
                    const cfg = STATUS_MAP[p.status] ?? {
                      label: p.status,
                      color: "text-gray-600",
                      bg: "bg-gray-50 border-gray-200",
                      icon: null,
                    };
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          #{p.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {fmtDate(p.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 text-xs">
                            {p.cangKinh && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                CK: {p.cangKinh}
                              </span>
                            )}
                            {p.banLe && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                BL: {p.banLe}
                              </span>
                            )}
                            {p.vienGong && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                VG: {p.vienGong}
                              </span>
                            )}
                            {p.chanVeMui && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                CVM: {p.chanVeMui}
                              </span>
                            )}
                            {p.cauGong && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                CG: {p.cauGong}
                              </span>
                            )}
                            {p.duoiGong && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                ĐG: {p.duoiGong}
                              </span>
                            )}
                            {!p.cangKinh &&
                              !p.banLe &&
                              !p.vienGong &&
                              !p.chanVeMui &&
                              !p.cauGong &&
                              !p.duoiGong && (
                                <span className="text-gray-400">Chưa nhập</span>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                          {p.note || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.status === "PrescriptionPending" && (
                            <div className="flex items-center justify-center gap-2">
                              {rejectingId === p.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="Lý do từ chối..."
                                    value={rejectReason}
                                    onChange={(e) =>
                                      setRejectReason(e.target.value)
                                    }
                                    className="border rounded-lg px-2 py-1 text-xs w-32"
                                  />
                                  <button
                                    onClick={() => handleReject(p.id)}
                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                  >
                                    Xác nhận
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingId(null);
                                      setRejectReason("");
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  >
                                    Huỷ
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setRejectingId(p.id)}
                                    className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                          {p.status === "PrescriptionConfirmed" &&
                            p.orderId && (
                              <span className="text-xs text-gray-500 font-mono">
                                Order #{p.orderId.slice(0, 8).toUpperCase()}
                              </span>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Hiển thị {filtered.length} / {prescriptions.length} đơn
          </div>
        </>
      )}
    </div>
  );
}
