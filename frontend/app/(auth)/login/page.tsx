"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login({ email: email.trim(), password });
      saveAuth(res.token, {
        userId: res.userId,
        email: res.email,
        fullName: res.fullName ?? null,
        role: res.role ?? null,
        expiresAt: res.expiresAt,
      });
      const role = (res.role ?? "").toLowerCase();
      if (role === "operation") {
        router.push("/operation");
      } else if (role === "manager") {
        router.push("/manager/dashboard");
      } else if (["sales", "admin"].includes(role)) {
        router.push("/sales");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A1A1A] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=85"
          alt="Premium eyewear"
          fill
          className="object-cover opacity-40"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#1A1A1A]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12">
          <Link href="/" className="inline-block mb-12">
            <span
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ELITE<span className="text-[#D4AF37]"> LENS</span>
            </span>
          </Link>
          <h1
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            See the World
            <br />
            Through <span className="text-[#D4AF37] italic">Clarity</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Sign in to access your wishlist, track orders, and explore exclusive
            collections curated just for you.
          </p>

          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border border-[#D4AF37]/20" />
          <div className="absolute -bottom-16 -right-16 w-28 h-28 rounded-full border border-[#D4AF37]/10" />
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/">
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ELITE<span className="text-[#D4AF37]"> LENS</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welcome Back
            </h2>
            <p className="text-[#6B7280]">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280]"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-[#D4AF37] hover:text-[#C9A030] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-[#E5E7EB] text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer accent-[#D4AF37]"
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#6B7280] cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full h-12 rounded-xl bg-[#1A1A1A] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#333] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-[#6B7280]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-11 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#1A1A1A] flex items-center justify-center gap-2 hover:bg-[#F5F5F5] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="h-11 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#1A1A1A] flex items-center justify-center gap-2 hover:bg-[#F5F5F5] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.22.05.45.05.68zm3.44 12.64c-.03.04-.75 2.3.8 4.83-.53 1.43-1.32 2.83-2.5 4.09-1.06 1.14-2.18 2.3-3.92 2.33-1.66.03-2.2-.97-4.1-.97-1.9 0-2.49.94-4.07 1-1.68.06-2.95-1.23-4.02-2.37C-.28 19.66-1.1 14.88.89 11.62c.99-1.62 2.76-2.64 4.68-2.67 1.6-.03 3.12 1.08 4.1 1.08.98 0 2.82-1.33 4.76-1.14.81.03 3.09.33 4.55 2.47-.12.07-2.71 1.59-2.68 4.73z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-sm text-[#6B7280]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#D4AF37] hover:text-[#C9A030] transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
