"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackageSearch,
  RotateCcw,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { getUser, clearAuth } from "@/lib/auth-storage";
import { NotificationProvider } from "@/lib/NotificationContext";
import NotificationBell from "@/components/NotificationBell";

const SALES_AREA_ROLES = ["Sales", "Admin", "Operation"];

function isSalesAreaRole(role: string | null): boolean {
  return role != null && SALES_AREA_ROLES.includes(role);
}

const staffNavItems = [
  { href: "/sales", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/sales/orders", label: "Quản lý đơn hàng", icon: Package },
  { href: "/sales/prescriptions", label: "Đơn gọng kính", icon: FileText },
  { href: "/sales/returns", label: "Đổi trả hàng", icon: RotateCcw },
];

const operationNavItems = [
  { href: "/operation", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/operation/orders", label: "Quản lý đơn hàng", icon: PackageSearch },
  { href: "/operation/returns", label: "Đổi trả hàng", icon: RotateCcw },
];

function getNavItems(role: string | null) {
  if (role === "Operation") return operationNavItems;
  return staffNavItems;
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = getUser();
  const navItems = getNavItems(user?.role ?? null);
  const isOperation = user?.role === "Operation";
  const homeHref = isOperation ? "/operation" : "/sales";
  const areaLabel = isOperation ? "Khu vực Operation" : "Khu vực nhân viên";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace(
        `/login?redirect=${isOperation ? "/operation" : "/sales"}`,
      );
      return;
    }
    if (!isSalesAreaRole(user.role)) {
      router.replace("/");
      return;
    }
  }, [mounted, user, router, isOperation]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  if (!mounted || !user || !isSalesAreaRole(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#F5F5F5] flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1A1A1A] text-white flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
            <Link
              href={homeHref}
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ELITE<span className="text-[#D4AF37]"> LENS</span>
              <span className="block text-[10px] font-normal text-white/60 tracking-widest uppercase mt-0.5">
                {areaLabel}
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== homeHref && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#D4AF37] text-[#1A1A1A]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                  <ChevronRight
                    className={`w-4 h-4 ml-auto opacity-60 ${
                      isActive ? "text-[#1A1A1A]" : ""
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10">
            <div className="px-3 py-2 mb-2 rounded-lg bg-white/5">
              <p className="text-xs font-semibold text-white/90 truncate">
                {user.fullName ?? "Nhân viên"}
              </p>
              <p className="text-[10px] text-white/50 truncate">{user.email}</p>
              {user.role && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                  {user.role}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white/90 backdrop-blur border-b border-[#E5E7EB] flex items-center px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F5F5F5]"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <Link
              href="/"
              className="ml-2 lg:ml-0 text-sm text-[#6B7280] hover:text-[#D4AF37] transition-colors"
            >
              ← Về trang chủ
            </Link>
            {/* Thông báo — Sales/Admin nhận đơn mới, Operation nhận xác nhận nhận hàng */}
            {isOperation ? (
              <div className="ml-auto">
                <NotificationBell mode="operation" />
              </div>
            ) : (
              <div className="ml-auto">
                <NotificationBell mode="sales" />
              </div>
            )}
          </header>
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </NotificationProvider>
  );
}
