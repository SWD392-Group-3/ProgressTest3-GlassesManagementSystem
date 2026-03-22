"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Tag, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/CartContext";
import { getUser } from "@/lib/auth-storage";
import { createOrderFromCart, getPublicPromotions } from "@/lib/api";

function isGuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [note, setNote] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedCartItemIds = useMemo(() => {
    const raw = searchParams.get("items");
    if (!raw) return [] as string[];
    return Array.from(
      new Set(
        raw
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    );
  }, [searchParams]);

  const checkoutItems = useMemo(() => {
    if (!cart) return [];
    if (selectedCartItemIds.length === 0) return cart.cartItems;
    const selectedSet = new Set(selectedCartItemIds);
    return cart.cartItems.filter((item) => selectedSet.has(item.id));
  }, [cart, selectedCartItemIds]);

  const checkoutTotal = checkoutItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  // Đơn chỉ gồm dịch vụ + slot: không hiển thị giao hàng và mã khuyến mãi
  const isServiceOnly =
    checkoutItems.length > 0 &&
    checkoutItems.every(
      (i) =>
        i.serviceId &&
        !i.productId &&
        !i.productVariantId &&
        !i.lensesVariantId &&
        !i.comboItemId,
    );

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
              Your cart is empty. Unable to proceed to checkout.
            </p>
            <Link
              href="/cart"
              className="text-[#D4AF37] hover:underline font-medium"
            >
              ← Back to cart
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (selectedCartItemIds.length > 0 && checkoutItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#6B7280] mb-4">
              Selected items were not found in your cart. Please select them
              again.
            </p>
            <Link
              href="/cart"
              className="text-[#D4AF37] hover:underline font-medium"
            >
              ← Back to cart
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || checkoutItems.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const promoInput = promotionCode.trim();
      let promotionIdToSend: string | null = null;

      if (!isServiceOnly && promoInput) {
        if (isGuid(promoInput)) {
          promotionIdToSend = promoInput;
        } else {
          const promotions = await getPublicPromotions();
          const now = new Date();
          const matchedPromotion = promotions.find((promotion) => {
            const sameCode =
              promotion.code.trim().toLowerCase() === promoInput.toLowerCase();
            const activeStatus =
              (promotion.status ?? "Active").trim().toLowerCase() === "active";
            const inDate =
              new Date(promotion.startDate) <= now &&
              now <= new Date(promotion.endDate);
            return sameCode && activeStatus && inDate;
          });

          if (!matchedPromotion) {
            throw new Error("Promotion code is invalid or expired.");
          }

          promotionIdToSend = matchedPromotion.id;
        }
      }

      const order = await createOrderFromCart({
        cartId: cart.id,
        selectedCartItemIds:
          selectedCartItemIds.length > 0
            ? checkoutItems.map((item) => item.id)
            : null,
        promotionId: isServiceOnly ? null : promotionIdToSend,
        shippingAddress: isServiceOnly ? "" : shippingAddress.trim(),
        shippingPhone: isServiceOnly ? "" : shippingPhone.trim(),
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
                Place order
              </span>
              <h1
                className="text-3xl font-bold text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Checkout
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left — Form */}
              <div className="lg:col-span-3 space-y-6">
                {!isServiceOnly && (
                  <>
                    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                      <h2 className="text-base font-bold text-[#1A1A1A] mb-5">
                        Shipping information
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                            Shipping address *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Street, ward, district, city..."
                            className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                            Phone number *
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
                            Note (optional)
                          </label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Notes for the delivery person..."
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                      <h2 className="text-base font-bold text-[#1A1A1A] mb-5 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#D4AF37]" />
                        Promotion code
                      </h2>
                      <input
                        type="text"
                        value={promotionCode}
                        onChange={(e) => setPromotionCode(e.target.value)}
                        placeholder="Enter promotion code (e.g. SAVE10)..."
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        * Enter the discount code provided by admin
                      </p>
                    </div>
                  </>
                )}

                {isServiceOnly && (
                  <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280]">
                      Your order contains only booked services. You can confirm
                      the order without shipping address or promotion code.
                    </p>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                        Note (optional)
                      </label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Note..."
                        className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] sticky top-28">
                  <h2
                    className="text-base font-bold text-[#1A1A1A] mb-5"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Order (
                    {isServiceOnly
                      ? `${checkoutItems.length} services`
                      : checkoutItems.every(
                            (i) =>
                              i.productId ||
                              i.productVariantId ||
                              i.lensesVariantId ||
                              i.comboItemId,
                          )
                        ? `${checkoutItems.length} products`
                        : `${checkoutItems.length} items`}
                    )
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                    {checkoutItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-[#6B7280] truncate max-w-[60%]">
                          {item.productVariantId
                            ? "Frame"
                            : item.productId
                              ? "Product"
                              : item.lensesVariantId
                                ? "Lenses"
                                : item.comboItemId
                                  ? "Combo"
                                  : "Service"}{" "}
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
                    <span className="font-semibold text-[#1A1A1A]">Total</span>
                    <span className="text-xl font-bold text-[#D4AF37]">
                      {fmt(checkoutTotal)}
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
                        Confirm order
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[#9CA3AF] text-center mt-3">
                    You can pay with MoMo after placing the order successfully
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
