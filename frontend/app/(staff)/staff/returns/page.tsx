"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, AlertCircle, RefreshCw, Check, X } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth-storage";
import {
  getPendingReturnExchanges,
  getApprovedReturnExchanges,
  reviewReturnExchange,
  receiveReturnExchange,
  type ReturnExchangeDto,
  type ReviewReturnExchangeRequest,
  type ReceiveReturnExchangeRequest,
  type ReceiveItemRequest,
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

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xử lý",
  Approved: "Đã phê duyệt",
  Rejected: "Đã từ chối",
  Received: "Đã nhận hàng",
  Resolved: "Hoàn tất",
};

export default function StaffReturnsPage() {
  const router = useRouter();
  const user = getUser();
  const isStaff = user?.role === "Staff";
  const isOperation = user?.role === "Operation";
  const canUseReturns = isStaff || isOperation;

  const [list, setList] = useState<ReturnExchangeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [receiveModalId, setReceiveModalId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [receiveForm, setReceiveForm] = useState<Record<string, { status: string; note: string; inspectionResult: string }>>({});
  const [receiveComment, setReceiveComment] = useState("");

  const fetchList = useCallback(async () => {
    if (!canUseReturns) return;
    setLoading(true);
    setError(null);
    try {
      if (isStaff) {
        const data = await getPendingReturnExchanges();
        setList(data);
      } else if (isOperation) {
        const data = await getApprovedReturnExchanges();
        setList(data);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải danh sách đổi trả";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [canUseReturns, isStaff, isOperation]);

  // Dùng user?.id thay vì user để tránh vòng lặp (getUser() có thể trả object mới mỗi lần render)
  const userId = user?.id ?? user?.email ?? null;
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchList();
  }, [userId, router, fetchList]);

  const handleApprove = async (id: string) => {
    try {
      const body: ReviewReturnExchangeRequest = {
        returnExchangeId: id,
        isApproved: true,
      };
      await reviewReturnExchange(body);
      setReviewingId(null);
      setRejectComment("");
      await fetchList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Phê duyệt thất bại");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const body: ReviewReturnExchangeRequest = {
        returnExchangeId: id,
        isApproved: false,
        rejectionReason: rejectComment || undefined,
      };
      await reviewReturnExchange(body);
      setReviewingId(null);
      setRejectComment("");
      await fetchList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Từ chối thất bại");
    }
  };

  const openReceiveModal = (re: ReturnExchangeDto) => {
    setReceiveModalId(re.id);
    const initial: Record<string, { status: string; note: string; inspectionResult: string }> = {};
    re.items.forEach((item) => {
      initial[item.id] = {
        status: "Received",
        note: "",
        inspectionResult: "Available",
      };
    });
    setReceiveForm(initial);
    setReceiveComment("");
  };

  const handleReceiveSubmit = async () => {
    if (!receiveModalId) return;
    const re = list.find((x) => x.id === receiveModalId);
    if (!re) return;
    const items: ReceiveItemRequest[] = re.items.map((item) => ({
      returnExchangeItemId: item.id,
      status: receiveForm[item.id]?.status ?? "Received",
      note: receiveForm[item.id]?.note || undefined,
      inspectionResult: receiveForm[item.id]?.inspectionResult || undefined,
    }));
    try {
      const body: ReceiveReturnExchangeRequest = {
        returnExchangeId: receiveModalId,
        comment: receiveComment || undefined,
        items,
      };
      await receiveReturnExchange(body);
      setReceiveModalId(null);
      await fetchList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Nhận hàng thất bại");
    }
  };

  if (!canUseReturns) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
            Nhân viên
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2" style={{ fontFamily: "var(--font-heading)" }}>
            Đổi trả hàng
          </h1>
          <p className="text-[#6B7280] mt-1">Xử lý yêu cầu hoàn hàng từ khách hàng.</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-[#1A1A1A] mb-1">
              Chức năng dành cho Nhân viên & Operation
            </h2>
            <p className="text-sm text-[#6B7280] mb-4">
              Để xử lý đổi trả hàng, tài khoản cần có vai trò <strong>Staff</strong> (phê
              duyệt/từ chối yêu cầu) hoặc <strong>Operation</strong> (nhận hàng &
              kiểm tra). Vai trò hiện tại của bạn:{" "}
              <span className="font-medium text-[#1A1A1A]">{user?.role ?? "—"}</span>.
            </p>
            <Link
              href="/staff"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:text-[#C9A030]"
            >
              ← Quay lại tổng quan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
          Nhân viên
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2" style={{ fontFamily: "var(--font-heading)" }}>
          Đổi trả hàng
        </h1>
        <p className="text-[#6B7280] mt-1">
          {isStaff
            ? "Xem và phê duyệt/từ chối yêu cầu hoàn hàng từ khách hàng."
            : "Xem yêu cầu đã phê duyệt và xác nhận nhận hàng."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {isStaff ? "Danh sách yêu cầu chờ xử lý" : "Danh sách yêu cầu đã phê duyệt"}
          </h2>
          <button
            type="button"
            onClick={fetchList}
            disabled={loading}
            className="p-2 rounded-lg text-[#6B7280] hover:bg-gray-100 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && list.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6B7280]">
            Không có yêu cầu nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Mã yêu cầu</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Đơn hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Lý do</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Trạng thái</th>
                  {isStaff && (
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
                  )}
                  {isOperation && (
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {list.map((re) => (
                  <tr key={re.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      #{(re.id ?? "").slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      #{(re.orderId ?? "").slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">
                      {re.reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{fmtDate(re.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {STATUS_LABEL[re.status] ?? re.status}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3">
                        {reviewingId === re.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="Lý do từ chối (nếu từ chối)"
                              value={rejectComment}
                              onChange={(e) => setRejectComment(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-xs w-full"
                            />
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => handleApprove(re.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium"
                              >
                                <Check className="w-3.5 h-3.5" /> Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(re.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium"
                              >
                                <X className="w-3.5 h-3.5" /> Từ chối
                              </button>
                              <button
                                type="button"
                                onClick={() => { setReviewingId(null); setRejectComment(""); }}
                                className="text-gray-500 text-xs"
                              >
                                Huỷ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewingId(re.id)}
                            className="text-[#D4AF37] hover:text-[#C9A030] font-medium text-xs underline"
                          >
                            Phê duyệt / Từ chối
                          </button>
                        )}
                      </td>
                    )}
                    {isOperation && (
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openReceiveModal(re)}
                          className="text-[#D4AF37] hover:text-[#C9A030] font-medium text-xs underline"
                        >
                          Nhận hàng
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nhận hàng (Operation) */}
      {receiveModalId && (() => {
        const re = list.find((x) => x.id === receiveModalId);
        if (!re) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Xác nhận nhận hàng</h3>
                <p className="text-sm text-gray-500 mt-1">Yêu cầu #{(re.id ?? "").slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú chung</label>
                  <input
                    type="text"
                    value={receiveComment}
                    onChange={(e) => setReceiveComment(e.target.value)}
                    placeholder="Tùy chọn"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                {re.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600">Item #{item.id.slice(0, 8)} — SL: {item.quantity}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Trạng thái</label>
                        <select
                          value={receiveForm[item.id]?.status ?? "Received"}
                          onChange={(e) =>
                            setReceiveForm((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] ?? { status: "Received", note: "", inspectionResult: "Available" }), status: e.target.value },
                            }))
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="Received">Đã nhận</option>
                          <option value="Rejected">Từ chối</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Kết quả kiểm tra</label>
                        <select
                          value={receiveForm[item.id]?.inspectionResult ?? "Available"}
                          onChange={(e) =>
                            setReceiveForm((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] ?? { status: "Received", note: "", inspectionResult: "Available" }), inspectionResult: e.target.value },
                            }))
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="Available">Tốt</option>
                          <option value="Defective">Lỗi</option>
                          <option value="Damaged">Hư hỏng</option>
                          <option value="NeedRepair">Cần sửa</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={receiveForm[item.id]?.note ?? ""}
                      onChange={(e) =>
                        setReceiveForm((prev) => ({
                          ...prev,
                          [item.id]: { ...(prev[item.id] ?? { status: "Received", note: "", inspectionResult: "Available" }), note: e.target.value },
                        }))
                      }
                      placeholder="Ghi chú"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReceiveModalId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={handleReceiveSubmit}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm font-medium hover:bg-[#C9A030]"
                >
                  Xác nhận nhận hàng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
