"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Eye,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { getUser, clearAuth, StoredUser } from "@/lib/auth-storage";
import NotificationBell from "@/components/NotificationBell";

const SALES_ROLES = ["Sales", "Admin"];
const isSalesUser = (u: StoredUser | null) =>
  u?.role != null && SALES_ROLES.includes(u.role);
const isOperationUser = (u: StoredUser | null) => u?.role === "Operation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Collection", href: "/products" },
  { name: "Sunglasses", href: "/products?category=sunglasses" },
  { name: "Optical", href: "/products?category=optical" },
  { name: "Blue-Light", href: "/products?category=blue-light" },
  { name: "Services", href: "/services" },
  { name: "Prescriptions", href: "/prescriptions" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { cartCount } = useCart();

  useEffect(() => {
    // Read localStorage only on client (avoids hydration mismatch)
    const syncUser = () => setUser(getUser());
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearAuth();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/login");
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ELITE
              <span className="text-[#D4AF37]"> LENS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium tracking-wide text-[#1A1A1A] hover:text-[#D4AF37] transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#D4AF37] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-black/5 transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#1A1A1A]" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors duration-200"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Notification bell — chỉ hiển thị cho Customer */}
            <div suppressHydrationWarning>
              {user?.role === "Customer" && <NotificationBell />}
            </div>

            {/* User — suppressHydrationWarning prevents mismatch because
                user is read from localStorage (null on SSR, set after mount) */}
            <div suppressHydrationWarning>
              {user ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-black/5 transition-colors duration-200"
                    aria-label="Account"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {(user.fullName ?? user.email)[0].toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[#E5E7EB]">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {user.fullName ?? "Khách hàng"}
                        </p>
                        <p className="text-xs text-[#6B7280] truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#6B7280]" />
                          Đơn hàng của tôi
                        </Link>
                        {!isSalesUser(user) && !isOperationUser(user) && (
                          <Link
                            href="/eye-results"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                          >
                            <Eye className="w-4 h-4 text-[#6B7280]" />
                            Kết quả khám mắt
                          </Link>
                        )}
                        {isSalesUser(user) && (
                          <Link
                            href="/sales"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors font-medium"
                          >
                            Khu vực nhân viên
                          </Link>
                        )}
                        {!isSalesUser(user) && isOperationUser(user) && (
                          <Link
                            href="/operation"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors font-medium"
                          >
                            Khu vực Operation
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex p-2 rounded-full hover:bg-black/5 transition-colors duration-200"
                  aria-label="Account"
                >
                  <User className="w-5 h-5 text-[#1A1A1A]" />
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-black/5 transition-colors duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#1A1A1A]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1A1A1A]" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            searchOpen ? "max-h-16 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search eyewear..."
              className="w-full h-10 pl-11 pr-4 rounded-full border border-[#E5E7EB] bg-white/80 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-16 bg-white transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6 pt-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium tracking-wide text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
              >
                Đơn hàng
              </Link>
              {!isSalesUser(user) && !isOperationUser(user) && (
                <Link
                  href="/eye-results"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium tracking-wide text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                >
                  Kết quả khám mắt
                </Link>
              )}
              {isSalesUser(user) && (
                <Link
                  href="/sales"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium tracking-wide text-[#D4AF37] hover:text-[#C9A030] transition-colors"
                >
                  Khu vực nhân viên
                </Link>
              )}
              {!isSalesUser(user) && isOperationUser(user) && (
                <Link
                  href="/operation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium tracking-wide text-[#D4AF37] hover:text-[#C9A030] transition-colors"
                >
                  Khu vực Operation
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-medium tracking-wide text-red-500 hover:text-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-[#D4AF37] text-white font-medium text-base tracking-wide hover:bg-[#C9A030] transition-colors"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
