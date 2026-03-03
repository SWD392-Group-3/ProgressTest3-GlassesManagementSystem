"use client";

import {
  ArrowRight,
  Box,
  ClipboardList,
  PackageSearch,
  Truck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth-storage";

export default function StaffOperationsPage() {
  const user = getUser();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
          Operations
        </span>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Xử lý &amp; vận hành đơn hàng
        </h1>
        <p className="text-[#6B7280] mt-1">
          Đóng gói sản phẩm, tạo vận đơn, cập nhật tracking và xử lý các loại
          đơn đặc biệt (pre-order, prescription).
        </p>
      </div>

      {/* Chào user */}
      <div className="mb-6 rounded-2xl bg-[#1F2937] text-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="text-sm text-white/70 mb-1">Xin chào,</p>
          <p
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {user?.fullName ?? "Operations Staff"}
          </p>
          <p className="text-xs mt-1 text-white/70 max-w-xl">
            Nhiệm vụ của bạn là đảm bảo đơn hàng được đóng gói, vận chuyển và xử
            lý theo đúng quy trình cho từng loại đơn.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60">Hôm nay</p>
            <p className="font-semibold mt-0.5">Đơn chờ đóng gói</p>
            <p className="text-2xl font-bold mt-1" style={{ fontFamily: "var(--font-heading)" }}>
              —
            </p>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60">Hôm nay</p>
            <p className="font-semibold mt-0.5">Đơn đang giao</p>
            <p className="text-2xl font-bold mt-1" style={{ fontFamily: "var(--font-heading)" }}>
              —
            </p>
          </div>
        </div>
      </div>

      {/* Các luồng công việc chính */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Đóng gói & vận chuyển */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Box className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Đóng gói &amp; tạo vận đơn
              </h2>
              <p className="text-xs text-[#6B7280]">
                Áp dụng cho các đơn hàng thông thường.
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-[#4B5563]">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                1
              </span>
              <div>
                <p className="font-semibold text-[#111827]">
                  Kiểm tra &amp; chuẩn bị sản phẩm
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Lấy hàng từ kho, kiểm tra tình trạng, đủ số lượng theo đơn.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                2
              </span>
              <div>
                <p className="font-semibold text-[#111827]">Đóng gói sản phẩm</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Sử dụng hộp/bìa phù hợp, chèn chống sốc, dán tem đúng chuẩn.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                3
              </span>
              <div>
                <p className="font-semibold text-[#111827]">
                  Tạo vận đơn &amp; tracking
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Tạo vận đơn trên hệ thống hãng vận chuyển, lưu mã tracking và
                  cập nhật trạng thái đơn sang <strong>Shipped</strong>.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
            <p className="text-xs text-[#6B7280]">
              Để xem chi tiết từng đơn và đổi trạng thái, vào mục{" "}
              <strong>Quản lý đơn hàng</strong>.
            </p>
            <Link
              href="/staff/orders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] hover:text-[#C9A030]"
            >
              Mở trang đơn hàng
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Đơn pre-order & prescription */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Pre-order &amp; đơn prescription
              </h2>
              <p className="text-xs text-[#6B7280]">
                Xử lý các đơn cần nhập kho hoặc gia công kính.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#4B5563]">
            <div>
              <h3 className="font-semibold text-[#111827]">
                Với đơn <span className="text-indigo-600">pre-order</span>
              </h3>
              <ul className="mt-1 space-y-1 text-xs list-disc list-inside text-[#6B7280]">
                <li>Nhận hàng từ nhà cung cấp, kiểm đếm và cập nhật kho.</li>
                <li>
                  Sau khi hàng về đầy đủ, chuyển đơn sang luồng{" "}
                  <strong>đóng gói &amp; tạo vận đơn</strong>.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#111827]">
                Với đơn <span className="text-indigo-600">prescription</span>
              </h3>
              <ul className="mt-1 space-y-1 text-xs list-disc list-inside text-[#6B7280]">
                <li>Nhận thông tin kê đơn (độ cầu, độ trụ, tròng, dịch vụ...).</li>
                <li>
                  Gia công lắp tròng, làm kính theo đúng thông số trước khi đóng
                  gói.
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] px-3 py-3">
              <Wrench className="w-4 h-4 text-[#6B7280] mt-0.5" />
              <p className="text-xs text-[#6B7280]">
                Các bước chi tiết cho pre-order &amp; prescription có thể được
                bổ sung thêm màn hình riêng và API trong các phiên bản tiếp
                theo. Hiện tại, bạn có thể theo dõi và cập nhật trạng thái trực
                tiếp trong{" "}
                <span className="font-semibold text-[#111827]">
                  Quản lý đơn hàng
                </span>
                .
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Khối tổng quan công việc hàng ngày */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Checklist công việc Operations
            </h2>
            <p className="text-xs text-[#6B7280]">
              Tham khảo quy trình mỗi ngày để đảm bảo đơn hàng luôn được xử lý
              đúng hạn.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-xs text-[#4B5563]">
          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="font-semibold text-[#111827] mb-1">
              1. Đơn mới &amp; chờ đóng gói
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kiểm tra các đơn mới được Staff/Admin xác nhận.</li>
              <li>Ưu tiên đơn gấp, đơn có lịch hẹn cụ thể.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="font-semibold text-[#111827] mb-1">
              2. Đơn đang gia công / pre-order
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Theo dõi tình trạng hàng về kho cho các đơn pre-order.</li>
              <li>Cập nhật tiến độ gia công cho đơn prescription.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="font-semibold text-[#111827] mb-1">
              3. Đơn đã giao &amp; hoàn hàng
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Theo dõi đơn đang giao, xử lý khi giao không thành công.</li>
              <li>Phối hợp với màn hình Đổi trả hàng khi có hoàn hàng.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Liên kết nhanh tới các màn hình liên quan */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/staff/orders"
          className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between hover:border-[#D4AF37]/60 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Quản lý đơn hàng
              </p>
              <p className="text-xs text-[#6B7280]">
                Tra cứu đơn, xem chi tiết và cập nhật trạng thái.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/staff/returns"
          className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between hover:border-[#D4AF37]/60 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Nhận &amp; kiểm tra hàng hoàn
              </p>
              <p className="text-xs text-[#6B7280]">
                Xử lý yêu cầu đổi trả sau khi nhân viên đã phê duyệt.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}

