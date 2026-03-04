"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/CartContext";
import { getUser } from "@/lib/auth-storage";

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function itemLabel(item: {
  productId: string | null;
  productVariantId: string | null;
  lensesVariantId: string | null;
  comboItemId: string | null;
  serviceId: string | null;
}) {
  if (item.productVariantId) return "Gọng kính";
  if (item.productId) return "Sản phẩm";
  if (item.lensesVariantId) return "Tròng kính";
  if (item.comboItemId) return "Combo";
  return "Dịch vụ";
}

function itemId(item: {
  productId: string | null;
  productVariantId: string | null;
  lensesVariantId: string | null;
  comboItemId: string | null;
  serviceId: string | null;
}) {
  return (
    item.productVariantId ??
    item.productId ??
    item.lensesVariantId ??
    item.comboItemId ??
    item.serviceId ??
    "—"
  );
}

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const user = getUser();

  const items = useMemo(() => cart?.cartItems ?? [], [cart]);

  // Sync selectedIds — loại bỏ id không còn tồn tại khi cart thay đổi
  const validIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const checkedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => validIds.has(id))),
    [selectedIds, validIds],
  );

  const allChecked = items.length > 0 && checkedIds.size === items.length;
  const someChecked = checkedIds.size > 0;

  const selectedItems = items.filter((i) => checkedIds.has(i.id));
  const selectedTotal = selectedItems.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0,
  );
  const selectedCount = selectedItems.reduce((s, i) => s + i.quantity, 0);

  function toggleAll() {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleQuantity(cartItemId: string, newQty: number) {
    if (newQty < 1) return;
    setUpdating(cartItemId);
    try {
      await updateItem(cartItemId, newQty);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemove(cartItemId: string) {
    setUpdating(cartItemId);
    // Bỏ chọn item bị xoá
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
    try {
      await removeItem(cartItemId);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  function handleCheckout() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (checkedIds.size === 0) return;
    // Truyền danh sách item đã chọn qua query string
    const ids = [...checkedIds].join(",");
    router.push(`/checkout?items=${ids}`);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
              Giỏ hàng
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Shopping Cart
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2
                className="text-2xl font-bold text-[#1A1A1A] mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Giỏ hàng trống
              </h2>
              <p className="text-[#6B7280] mb-8 max-w-sm">
                Bạn chưa có sản phẩm nào trong giỏ. Hãy khám phá bộ sưu tập
                của chúng tôi.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#D4AF37] text-white font-semibold text-sm hover:bg-[#C9A030] transition-colors"
              >
                Khám phá sản phẩm
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {/* Select All Row */}
                <div className="bg-white rounded-2xl px-5 py-3 border border-[#E5E7EB] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="flex items-center gap-2.5 text-sm font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                  >
                    {allChecked ? (
                      <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                    ) : someChecked ? (
                      <CheckSquare className="w-5 h-5 text-[#D4AF37] opacity-50" />
                    ) : (
                      <Square className="w-5 h-5 text-[#9CA3AF]" />
                    )}
                    Chọn tất cả ({items.length} sản phẩm)
                  </button>
                  {someChecked && (
                    <span className="ml-auto text-xs text-[#6B7280]">
                      Đã chọn{" "}
                      <span className="font-semibold text-[#D4AF37]">
                        {checkedIds.size}
                      </span>{" "}
                      sản phẩm
                    </span>
                  )}
                </div>

                {/* Items */}
                {items.map((item) => {
                  const isChecked = checkedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-5 border-2 transition-all ${
                        updating === item.id
                          ? "opacity-50 pointer-events-none"
                          : ""
                      } ${
                        isChecked
                          ? "border-[#D4AF37]"
                          : "border-[#E5E7EB] hover:border-[#D4AF37]/40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="mt-1 shrink-0"
                          aria-label={
                            isChecked ? "Bỏ chọn sản phẩm" : "Chọn sản phẩm"
                          }
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-5 h-5 text-[#9CA3AF] hover:text-[#D4AF37] transition-colors" />
                          )}
                        </button>

                        {/* Placeholder image */}
                        <div className="w-20 h-20 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#6B7280] mb-1">
                                {itemLabel(item)}
                              </p>
                              <p className="text-sm font-semibold text-[#1A1A1A]">
                                ID: {itemId(item).slice(0, 8)}...
                              </p>
                              {item.note && (
                                <p className="text-xs text-[#6B7280] mt-1">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              aria-label="Xóa sản phẩm"
                              onClick={() => handleRemove(item.id)}
                              className="p-1.5 rounded-full hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity */}
                            <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-3 py-1">
                              <button
                                type="button"
                                aria-label="Giảm số lượng"
                                onClick={() =>
                                  handleQuantity(item.id, item.quantity - 1)
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Tăng số lượng"
                                onClick={() =>
                                  handleQuantity(item.id, item.quantity + 1)
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-xs text-[#6B7280]">
                                {fmt(item.unitPrice)} × {item.quantity}
                              </p>
                              <p className="text-base font-bold text-[#1A1A1A]">
                                {fmt(item.unitPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] sticky top-28">
                  <h2
                    className="text-lg font-bold text-[#1A1A1A] mb-6"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Tóm tắt đơn hàng
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">
                        Đã chọn ({selectedCount} sản phẩm)
                      </span>
                      <span className="font-medium text-[#1A1A1A]">
                        {fmt(selectedTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">
                        Miễn phí
                      </span>
                    </div>
                    <div className="h-px bg-[#E5E7EB]" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#1A1A1A]">
                        Tổng cộng
                      </span>
                      <span className="text-xl font-bold text-[#D4AF37]">
                        {fmt(selectedTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkedIds.size === 0}
                    className="w-full h-12 rounded-full bg-[#D4AF37] text-white font-semibold text-sm hover:bg-[#C9A030] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Tiến hành thanh toán
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {checkedIds.size === 0 && (
                    <p className="text-xs text-center text-[#9CA3AF] mt-3">
                      Vui lòng chọn ít nhất 1 sản phẩm
                    </p>
                  )}

                  <Link
                    href="/products"
                    className="block text-center mt-4 text-sm text-[#6B7280] hover:text-[#D4AF37] transition-colors"
                  >
                    ← Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

