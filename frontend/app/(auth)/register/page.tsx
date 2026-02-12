"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong"];
  const strengthColors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
  ];

  const passwordsMatch =
    form.confirmPassword !== "" && form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    // TODO: Integrate with backend auth API
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A1A1A] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=85"
          alt="Premium eyewear collection"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#1A1A1A]/60 to-transparent" />

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
            Join the
            <br />
            <span className="text-[#D4AF37] italic">Elite</span> Circle
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Create your account to unlock exclusive collections, personalized
            recommendations, and member-only benefits.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              "Free shipping on your first order",
              "Exclusive member-only collections",
              "Virtual Try-On for every frame",
              "Early access to new arrivals",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#D4AF37]" />
                </div>
                <span className="text-sm text-white/70">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border border-[#D4AF37]/20" />
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 bg-white overflow-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ELITE<span className="text-[#D4AF37]"> LENS</span>
              </span>
            </Link>
          </div>

          <div className="mb-6">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Create Account
            </h2>
            <p className="text-[#6B7280]">
              Fill in your details to get started.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="regEmail"
                className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="regEmail"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-1.5"
              >
                Phone Number{" "}
                <span className="normal-case tracking-normal font-normal">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+84 xxx xxx xxx"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="regPassword"
                className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="regPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full h-11 pl-11 pr-12 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5]/50 text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
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

              {/* Password Strength Bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1.5 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i < strength
                            ? strengthColors[strength - 1]
                            : "bg-[#E5E7EB]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#6B7280]">
                    {strength > 0
                      ? strengthLabels[strength - 1]
                      : "Enter a password"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  placeholder="Re-enter your password"
                  required
                  className={`w-full h-11 pl-11 pr-12 rounded-xl border text-sm text-[#1A1A1A] placeholder-[#6B7280]/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    form.confirmPassword
                      ? passwordsMatch
                        ? "border-green-400 bg-green-50/30 focus:border-green-400 focus:ring-green-400/10"
                        : "border-red-400 bg-red-50/30 focus:border-red-400 focus:ring-red-400/10"
                      : "border-[#E5E7EB] bg-[#F5F5F5]/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {form.confirmPassword && !passwordsMatch && (
                <p className="text-[10px] text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#E5E7EB] text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer accent-[#D4AF37]"
              />
              <label
                htmlFor="terms"
                className="text-sm text-[#6B7280] cursor-pointer leading-snug"
              >
                I agree to the{" "}
                <Link href="#" className="text-[#D4AF37] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-[#D4AF37] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full h-12 rounded-xl bg-[#D4AF37] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#C9A030] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-[#6B7280]">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Register */}
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

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-[#6B7280]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#D4AF37] hover:text-[#C9A030] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
