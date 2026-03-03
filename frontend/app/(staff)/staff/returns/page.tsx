"use client";

import { RotateCcw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth-storage";

export default function StaffReturnsPage() {
  const user = getUser();
  const isStaff = user?.role === "Staff";
  const isOperation = user?.role === "Operation";
  const canUseReturns = isStaff || isOperation;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
          Nhân viên
        </span>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Đổi trả hàng
        </h1>
        <p className="text-[#6B7280] mt-1">
          Xử lý yêu cầu hoàn hàng từ khách hàng.
        </p>
      </div>

      {canUseReturns ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">
            Danh sách yêu cầu đổi trả
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            {isStaff &&
              "Vai trò Nhân viên: xem yêu cầu chờ xử lý (GET /api/ReturnExchange/pending) và phê duyệt/từ chối (POST /api/ReturnExchange/review)."}
            {isOperation &&
              "Vai trò Operation: xem yêu cầu đã phê duyệt (GET /api/ReturnExchange/approved) và nhận hàng (POST /api/ReturnExchange/receive)."}
          </p>
          <p className="text-xs text-[#6B7280]">
            Giao diện danh sách và thao tác đổi trả có thể được tích hợp tiếp
            với API ReturnExchange. Hiện bạn có thể gọi API trực tiếp (Postman,
            etc.) với token đăng nhập.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
