"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuth } from "@/lib/auth-storage";
import {
  LayoutDashboard,
  FileText,
  Package,
  Tag,
  Users,
  LogOut,
  Calendar,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/manager/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/manager/policies", icon: FileText, label: "Policies" },
  { href: "/manager/products", icon: Package, label: "Products" },
  { href: "/manager/promotions-combos", icon: Tag, label: "Pricing & Promos" },
  { href: "/manager/slots", icon: Calendar, label: "Slots & Schedule" },
  { href: "/manager/users", icon: Users, label: "Users & Sales" },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/manager/dashboard" className="flex items-center gap-2">
            <span className="font-heading font-bold text-2xl text-primary">Elite</span>
            <span className="font-heading text-2xl text-accent">Manager</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <NavItem
              key={href}
              href={href}
              icon={<Icon size={20} />}
              label={label}
              active={pathname === href}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-muted hover:text-red-500 hover:bg-red-50 transition-colors rounded-md">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 max-w-[85vw] bg-white border-r border-border flex flex-col transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link
            href="/manager/dashboard"
            className="flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-heading font-bold text-xl text-primary">Elite</span>
            <span className="font-heading text-xl text-accent">Manager</span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="p-2 rounded-md text-muted hover:bg-secondary hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                pathname === href
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted hover:text-primary hover:bg-secondary"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-muted hover:text-red-500 hover:bg-red-50 transition-colors rounded-md">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-border p-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            aria-label="Open menu"
            className="p-2 rounded-md text-muted hover:bg-secondary hover:text-primary"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link href="/manager/dashboard" className="flex items-center gap-1">
            <span className="font-heading font-bold text-lg text-primary">Elite</span>
            <span className="font-heading text-lg text-accent">Manager</span>
          </Link>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#fafafa]">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200
        ${active ? "bg-accent/10 text-accent font-medium" : "text-muted hover:text-primary hover:bg-secondary"}
        focus:outline-none focus:ring-2 focus:ring-accent/50 group`}
    >
      <span className={active ? "text-accent" : "text-muted group-hover:text-accent transition-colors"}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
