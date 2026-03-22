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

export default function OperationDashboardPage() {
  const user = getUser();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
          Operations Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2">
          Order processing &amp; operations
        </h1>
        <p className="text-[#6B7280] mt-1">
          Pack products, handle lens fitting, update delivery statuses, and
          process returns.
        </p>
      </div>

      {/* Chào user */}
      <div className="mb-6 rounded-2xl bg-[#1F2937] text-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="text-sm text-white/70 mb-1">Hello,</p>
          <p className="text-xl font-semibold">
            {user?.fullName ?? "Operations Staff"}
          </p>
          <p className="text-xs mt-1 text-white/70 max-w-xl">
            Your role is to ensure each order is packed, fulfilled, and shipped
            through the correct workflow (Confirmed {">"} ProcessingTemplate
            {">"} Manufacturing {">"} Shipped {">"} Delivered).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60">Today</p>
            <p className="font-semibold mt-0.5">Pending packaging</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60">Today</p>
            <p className="font-semibold mt-0.5">In transit</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Đóng gói & vận chuyển đơn thông thường */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Box className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Packaging &amp; shipment creation
              </h2>
              <p className="text-xs text-[#6B7280]">
                For standard product orders.
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
                  Inspect &amp; prepare items
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Pick items from inventory, verify quality, and confirm
                  quantity.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                2
              </span>
              <div>
                <p className="font-semibold text-[#111827]">Pack the items</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Use proper packaging, add protection, and label correctly.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                3
              </span>
              <div>
                <p className="font-semibold text-[#111827]">
                  Create shipment &amp; tracking
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Create shipping records in the carrier system, save tracking,
                  and update status to <strong>Shipped</strong>.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
            <p className="text-xs text-[#6B7280]">
              To view details and update statuses, open{" "}
              <strong>Order management</strong>.
            </p>
            <Link
              href="/operation/orders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] hover:text-[#C9A030]"
            >
              Open orders page
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Đơn pre-order & prescription */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Prescription orders
              </h2>
              <p className="text-xs text-[#6B7280]">
                Workflow for orders created by Sales from customer
                prescriptions.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#4B5563]">
            <ol className="space-y-3 text-sm text-[#4B5563]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-[#111827]">
                    Receive order &amp; prepare lens setup
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    In Order management, move new orders (Confirmed) to
                    ProcessingTemplate to begin.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-[#111827]">
                    Lens fitting &amp; processing
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Follow prescription specs, fit lenses precisely, and update
                    status to Manufacturing.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-[#F3F4F6] text-[11px] flex items-center justify-center font-semibold text-[#4B5563]">
                  3
                </span>
                <div>
                  <p className="font-semibold text-[#111827]">
                    Ship &amp; complete
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Move order to Shipped and finally to Delivered.
                  </p>
                </div>
              </li>
            </ol>

            <div className="flex items-start gap-2 rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] px-3 py-3">
              <Wrench className="w-4 h-4 text-[#6B7280] mt-0.5" />
              <p className="text-xs text-[#6B7280]">
                For <strong>pre-order</strong> orders: receive items from
                suppliers, count and update inventory before switching to
                <strong> packaging &amp; shipment creation</strong>.
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
              Operations checklist
            </h2>
            <p className="text-xs text-[#6B7280]">
              Follow this daily checklist to keep orders on schedule.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-xs text-[#4B5563]">
          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="font-semibold text-[#111827] mb-1">
              1. New &amp; pending packaging
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Review newly confirmed orders from Sales/Admin.</li>
              <li>Prioritize urgent orders and scheduled deliveries.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="font-semibold text-[#111827] mb-1">
              2. Manufacturing / pre-order
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Track inbound stock for pre-order items.</li>
              <li>Update processing progress for prescription orders.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="font-semibold text-[#111827] mb-1">
              3. Delivered &amp; returns
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Monitor in-transit orders and handle failed deliveries.</li>
              <li>Coordinate with the Returns screen for return shipments.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Liên kết nhanh tới các màn hình liên quan */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/operation/orders"
          className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between hover:border-[#D4AF37]/60 hover:shadow-sm transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Orders dashboard
              </p>
              <p className="text-xs text-[#6B7280]">
                Search orders, track prescription progress, and update statuses.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/operation/returns"
          className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between hover:border-[#D4AF37]/60 hover:shadow-sm transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Receive &amp; inspect returns
              </p>
              <p className="text-xs text-[#6B7280]">
                Process return/exchange requests after Sales approval.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </section>
    </div>
  );
}
