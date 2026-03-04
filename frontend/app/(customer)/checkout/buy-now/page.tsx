"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Zap, MapPin, Phone, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth-storage";
import { apiRequest } from "@/lib/api";

interface CreateManualOrderItem {
  productVariantId: string;
  quantity: number;
}

interface CreateManualOrderRequest {
  promotionId?: string;
  shippingAddress: string;
  shippingPhone: string;
  items: CreateManualOrderItem[];
}

interface OrderResponse {
  orderId: string;
  [key: string]: unknown;
}

function BuyNowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();

  const productId = searchParams.get("productId") ?? "";
  const qty = parseInt(searchParams.get("qty") ?? "1", 10);
  const price = parseFloat(searchParams.get("price") ?? "0");
  const productName = searchParams.get("name") ?? "Sản phẩm";

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [promotionId, setPromotionId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = price * qty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingAddress.trim() || !shippingPhone.trim()) {
      setError("Vui lòng điền đầy đủ địa chỉ và số điện thoại.");
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const body: CreateManualOrderRequest = {
        shippingAddress: shippingAddress.trim(),
        shippingPhone: shippingPhone.trim(),
        items: [{ productVariantId: productId, quantity: qty }],
      };
      if (promotionId.trim()) body.promotionId = promotionId.trim();

      const data = await apiRequest<OrderResponse>("/api/order/manual", {
        method: "POST",
        body: JSON.stringify(body),
      });

      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      setError((err as Error).message ?? "Có lỗi xảy ra, vui lòng thử lại.");
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
            <h1 className="text-lg font-bold text-[#1A1A1A]">Mua ngay</h1>
            <p className="text-xs text-[#6B7280]">
              Đặt hàng nhanh không qua giỏ
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Product Summary */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-[#6B7280] mb-4">
            Sản phẩm đặt mua
          </h2>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-[#1A1A1A] leading-snug">
                {productName}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">Số lượng: {qty}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B7280]">
                {price.toLocaleString("vi-VN")}₫ × {qty}
              </p>
              <p className="text-base font-bold text-[#D4AF37] mt-0.5">
                {subtotal.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] mt-4 pt-4 flex justify-between">
            <span className="text-sm font-semibold text-[#1A1A1A]">
              Tổng cộng
            </span>
            <span className="text-lg font-bold text-[#1A1A1A]">
              {subtotal.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-[#6B7280] mb-5">
            Thông tin giao hàng
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                Địa chỉ nhận hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] mb-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Số điện thoại <span className="text-red-500">*</span>
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
                Mã khuyến mãi{" "}
                <span className="text-[#9CA3AF] font-normal">(tuỳ chọn)</span>
              </label>
              <input
                type="text"
                value={promotionId}
                onChange={(e) => setPromotionId(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] mb-2 block">
                Ghi chú{" "}
                <span className="text-[#9CA3AF] font-normal">(tuỳ chọn)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú đặc biệt cho đơn hàng..."
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
                  Xác nhận đặt hàng
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-[#9CA3AF] pb-4">
          Bằng cách đặt hàng, bạn đồng ý với{" "}
          <span className="text-[#D4AF37] cursor-pointer hover:underline">
            Điều khoản dịch vụ
          </span>{" "}
          của chúng tôi.
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
