"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Tag, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/CartContext";
import { getUser } from "@/lib/auth-storage";
import { createOrderFromCart } from "@/lib/api";

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const router = useRouter();
  const user = getUser();

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [note, setNote] = useState("");
  const [promotionId, setPromotionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!cart || cart.cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#6B7280] mb-4">
              Giỏ hàng trống, không thể checkout.
            </p>
            <Link
              href="/cart"
              className="text-[#D4AF37] hover:underline font-medium"
            >
              ← Quay lại giỏ hàng
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart) return;
    setError(null);
    setLoading(true);
    try {
      const order = await createOrderFromCart({
        cartId: cart.id,
        promotionId: promotionId.trim() || null,
        shippingAddress: shippingAddress.trim(),
        shippingPhone: shippingPhone.trim(),
        note: note.trim() || null,
      });
      await fetchCart(); // làm mới giỏ (đã rỗng sau khi đặt)
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
                Đặt hàng
              </span>
              <h1
                className="text-3xl font-bold text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Thanh toán
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left — Form */}
              <div className="lg:col-span-3 space-y-6">
                {/* Shipping info */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                  <h2 className="text-base font-bold text-[#1A1A1A] mb-5">
                    Thông tin giao hàng
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                        Địa chỉ giao hàng *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Số nhà, tên đường, phường, quận, thành phố..."
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                        Ghi chú (tuỳ chọn)
                      </label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Ghi chú cho người giao hàng..."
                        className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Promotion code */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                  <h2 className="text-base font-bold text-[#1A1A1A] mb-5 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#D4AF37]" />
                    Mã khuyến mãi
                  </h2>
                  <input
                    type="text"
                    value={promotionId}
                    onChange={(e) => setPromotionId(e.target.value)}
                    placeholder="Nhập Promotion ID (nếu có)..."
                    className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    * Nhập ID của mã giảm giá do admin cung cấp
                  </p>
                </div>
              </div>

              {/* Right — Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] sticky top-28">
                  <h2
                    className="text-base font-bold text-[#1A1A1A] mb-5"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Đơn hàng ({cart.cartItems.length} sản phẩm)
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                    {cart.cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-[#6B7280] truncate max-w-[60%]">
                          {item.productVariantId
                            ? "Gọng kính"
                            : item.lensesVariantId
                              ? "Tròng kính"
                              : item.comboItemId
                                ? "Combo"
                                : "Dịch vụ"}{" "}
                          × {item.quantity}
                        </span>
                        <span className="font-medium text-[#1A1A1A] shrink-0">
                          {fmt(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-[#E5E7EB] mb-4" />
                  <div className="flex justify-between mb-6">
                    <span className="font-semibold text-[#1A1A1A]">
                      Tổng cộng
                    </span>
                    <span className="text-xl font-bold text-[#D4AF37]">
                      {fmt(cart.totalAmount)}
                    </span>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-[#D4AF37] text-white font-semibold text-sm hover:bg-[#C9A030] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[#9CA3AF] text-center mt-3">
                    Bạn có thể thanh toán Momo sau khi đặt hàng thành công
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
