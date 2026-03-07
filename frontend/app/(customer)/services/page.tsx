"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getServices,
  getAvailableSlots,
  ServiceDto,
  SlotDto,
} from "@/lib/api/product";
import { useCart } from "@/lib/CartContext";
import { getUser } from "@/lib/auth-storage";
import {
  Loader2,
  Eye,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Calendar,
  Clock,
  X,
} from "lucide-react";

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatSlotTime(start: string, end: string) {
  const s = start.slice(0, 5);
  const e = end.slice(0, 5);
  return `${s} - ${e}`;
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
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

  // Book slot modal
  const [modalService, setModalService] = useState<ServiceDto | null>(null);
  const [slotDate, setSlotDate] = useState(() => toDateString(new Date()));
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);

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

  // Khi mở modal hoặc đổi ngày → load slots
  useEffect(() => {
    if (!modalService) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    const today = toDateString(new Date());
    if (slotDate < today) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    getAvailableSlots(slotDate)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modalService, slotDate]);

  function openBookSlotModal(service: ServiceDto) {
    setModalService(service);
    setSlotDate(toDateString(new Date()));
    setSelectedSlot(null);
  }

  function closeModal() {
    setModalService(null);
    setSlots([]);
    setSelectedSlot(null);
  }

  async function handleAddToCart(service: ServiceDto) {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    openBookSlotModal(service);
  }

  async function confirmBookSlot() {
    if (!modalService || !selectedSlot) return;
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setAddingId(modalService.id);
    try {
      await addItem({
        serviceId: modalService.id,
        slotId: selectedSlot.id,
        quantity: 1,
      });
      setAddedId(modalService.id);
      setTimeout(() => setAddedId(null), 2000);
      closeModal();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAddingId(null);
    }
  }

  const today = toDateString(new Date());
  const minDate = today;

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

          {/* Book slot modal */}
          {modalService && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1A1A1A]">
                      Đặt lịch: {modalService.name}
                    </h3>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="p-1 rounded-full hover:bg-gray-100 text-[#6B7280]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Chọn ngày
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Chọn khung giờ
                    </label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-[#6B7280] py-4 text-center">
                        {slotDate < today
                          ? "Vui lòng chọn ngày hiện tại hoặc tương lai."
                          : "Không có khung giờ trống trong ngày này. Vui lòng chọn ngày khác."}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                              selectedSlot?.id === slot.id
                                ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                                : "bg-white text-[#374151] border-gray-300 hover:border-[#D4AF37]"
                            }`}
                          >
                            {formatSlotTime(slot.startTime, slot.endTime)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2.5 rounded-lg border border-gray-300 text-[#374151] font-medium hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={confirmBookSlot}
                      disabled={!selectedSlot || addingId === modalService.id}
                      className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] text-white font-medium hover:bg-[#333] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {addingId === modalService.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Xác nhận đặt lịch
                        </>
                      )}
                    </button>
                  </div>
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
