"use client";

import Link from "next/link";
import { Package, RotateCcw, LayoutDashboard, ArrowRight } from "lucide-react";
import { getUser } from "@/lib/auth-storage";

const cards = [
  {
    title: "Order management",
    description:
      "Search orders by ID, view details and update order status.",
    href: "/sales/orders",
    icon: Package,
    accent: "bg-[#D4AF37]/10 text-[#D4AF37]",
  },
  {
    title: "Returns & exchanges",
    description:
      "Process return requests (Sales: approve/reject, Operation: receive & inspect).",
    href: "/sales/returns",
    icon: RotateCcw,
    accent: "bg-indigo-500/10 text-indigo-600",
  },
];

export default function SalesDashboardPage() {
  const user = getUser();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
          Staff area
        </span>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Hello, {user?.fullName ?? "Staff"}
        </h1>
        <p className="text-[#6B7280] mt-1">
          Choose an option below to get started.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group block bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.accent}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors">
                {card.title}
              </h2>
              <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
                {card.description}
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] group-hover:gap-3 transition-all">
                Open
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 p-5 rounded-2xl bg-white border border-[#E5E7EB]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-[#6B7280]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A] mb-1">
              Your role
            </h3>
            <p className="text-sm text-[#6B7280]">
              {user?.role === "Admin"
                ? "Administrator: full access to orders and system."
                : user?.role === "Sales"
                  ? "Store staff: search orders, update status, approve/reject returns."
                  : user?.role === "Operation"
                    ? "Operations: receive returns, inspect and update results."
                    : "You have access to the staff area."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
