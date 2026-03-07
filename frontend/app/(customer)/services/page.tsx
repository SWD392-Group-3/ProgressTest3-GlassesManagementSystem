"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServices, ServiceDto } from "@/lib/api/product";
import { useCart } from "@/lib/CartContext";
import { getUser } from "@/lib/auth-storage";
import {
  Loader2,
  Eye,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Map service name to a relevant icon / color accent
const SERVICE_COLORS = [
  "from-amber-50 to-yellow-50 border-amber-200",
  "from-blue-50 to-sky-50 border-blue-200",
  "from-emerald-50 to-green-50 border-emerald-200",
  "from-purple-50 to-violet-50 border-purple-200",
  "from-rose-50 to-pink-50 border-rose-200",
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getServices();
        // Only show Active services to customers
        setServices(data.filter((s) => s.status !== "Inactive"));
      } catch {
        setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAddToCart(service: ServiceDto) {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setAddingId(service.id);
    try {
      await addItem({
        serviceId: service.id,
        quantity: 1,
      });
      setAddedId(service.id);
      setTimeout(() => setAddedId(null), 2000);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Chuyên nghiệp &amp; Tận tâm
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Dịch vụ của chúng tôi
            </h1>
            <p className="mt-4 text-[#6B7280] max-w-xl mx-auto text-sm sm:text-base">
              Đặt lịch dịch vụ khám mắt, tư vấn và lắp kính chuyên nghiệp. Thêm
              vào giỏ hàng để thanh toán cùng đơn đặt hàng của bạn.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-[#D4AF37] hover:underline text-sm"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-24">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#6B7280]">Hiện chưa có dịch vụ nào.</p>
            </div>
          )}

          {/* Service cards grid */}
          {!loading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => {
                const colorClass = SERVICE_COLORS[idx % SERVICE_COLORS.length];
                const isAdding = addingId === service.id;
                const isAdded = addedId === service.id;

                return (
                  <div
                    key={service.id}
                    className={`bg-gradient-to-br ${colorClass} border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow`}
                  >
                    {/* Icon area */}
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/80">
                      <Eye className="w-6 h-6 text-[#D4AF37]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-[#1A1A1A] mb-1">
                        {service.name}
                      </h2>
                      {service.description && (
                        <p className="text-sm text-[#6B7280] leading-relaxed">
                          {service.description}
                        </p>
                      )}
                    </div>

                    {/* Price + Button */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/5">
                      <span className="text-lg font-bold text-[#D4AF37]">
                        {fmt(service.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(service)}
                        disabled={isAdding || isAdded}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          isAdded
                            ? "bg-green-500 text-white"
                            : "bg-[#1A1A1A] text-white hover:bg-[#333] disabled:opacity-60"
                        }`}
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAdded ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Đã thêm
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Thêm vào giỏ
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom note */}
          {!loading && !error && services.length > 0 && (
            <p className="text-center text-xs text-[#9CA3AF] mt-10">
              * Kết quả đo mắt sẽ được nhân viên ghi nhận sau khi bạn hoàn tất
              dịch vụ và có thể xem lại trong trang chi tiết đơn hàng.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
