"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Zap, MapPin, Phone, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth-storage";
import { apiRequest } from "@/lib/api";

interface CreateManualOrderItem {
  productVariantId?: string;
  productId?: string;
  quantity: number;
}

interface CreateManualOrderRequest {
  promotionId?: string;
  shippingAddress: string;
  shippingPhone: string;
  note?: string;
  items: CreateManualOrderItem[];
}

interface OrderResponse {
  id: string;
  [key: string]: unknown;
}

function BuyNowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();

  // Support both productVariantId (variant products) and productId (non-variant products)
  const productVariantId = searchParams.get("productVariantId") ?? "";
  const productId = searchParams.get("productId") ?? "";
  const qty = parseInt(searchParams.get("qty") ?? "1", 10);
  const price = parseFloat(searchParams.get("price") ?? "0");
  const productName = searchParams.get("name") ?? "Product";

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [promotionId, setPromotionId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login when user is not authenticated
  if (!user) {
    router.replace("/login");
    return null;
  }

  const subtotal = price * qty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingAddress.trim() || !shippingPhone.trim()) {
      setError("Please enter both shipping address and phone number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Build item payload — prioritize productVariantId, fallback to productId
      const item: CreateManualOrderItem = { quantity: qty };
      if (productVariantId) item.productVariantId = productVariantId;
      else if (productId) item.productId = productId;

      const body: CreateManualOrderRequest = {
        shippingAddress: shippingAddress.trim(),
        shippingPhone: shippingPhone.trim(),
        items: [item],
      };
      if (promotionId.trim()) body.promotionId = promotionId.trim();
      if (note.trim()) body.note = note.trim();

      const data = await apiRequest<OrderResponse>(
        "/api/order/manual",
        { method: "POST", body: JSON.stringify(body) },
        { auth: true },
      );

      router.push(`/orders/${data.id}`);
    } catch (err) {
      setError(
        (err as Error).message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/products/${productId}`}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Buy Now</h1>
            <p className="text-xs text-[#6B7280]">Fast checkout without cart</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Product Summary */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-[#6B7280] mb-4">
            Product Summary
          </h2>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-[#1A1A1A] leading-snug">
                {productName}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">Quantity: {qty}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B7280]">
                {price.toLocaleString("en-US")}₫ × {qty}
              </p>
              <p className="text-base font-bold text-[#D4AF37] mt-0.5">
                {subtotal.toLocaleString("en-US")}₫
              </p>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] mt-4 pt-4 flex justify-between">
            <span className="text-sm font-semibold text-[#1A1A1A]">Total</span>
            <span className="text-lg font-bold text-[#1A1A1A]">
              {subtotal.toLocaleString("en-US")}₫
            </span>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-[#6B7280] mb-5">
            Shipping Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                Shipping Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="House no., street, ward, district, city"
                className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] mb-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>

            {/* Promotion */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] mb-2">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                Promotion Code{" "}
                <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={promotionId}
                onChange={(e) => setPromotionId(e.target.value)}
                placeholder="Enter discount code"
                className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] mb-2 block">
                Note{" "}
                <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Special instructions for this order..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-full bg-[#1A1A1A] text-white font-semibold text-sm tracking-wide hover:bg-[#333] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  Confirm Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-[#9CA3AF] pb-4">
          By placing an order, you agree to our{" "}
          <span className="text-[#D4AF37] cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          .
        </p>
      </div>
    </div>
  );
}

export default function BuyNowPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <BuyNowContent />
    </Suspense>
  );
}
