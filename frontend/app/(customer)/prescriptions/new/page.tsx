"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createPrescription } from "@/lib/api/prescription";
import { apiRequest, API } from "@/lib/api/client";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await apiRequest<ServiceOption[]>(API.services.getAll, {
          method: "GET",
        });
        setServices(data || []);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  const [formData, setFormData] = useState({
    serviceId: "",
    cangKinh: "",
    banLe: "",
    vienGong: "",
    chanVeMui: "",
    cauGong: "",
    duoiGong: "",
    note: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.serviceId) {
        setError("Please select an eye exam/fitting service.");
        setLoading(false);
        return;
      }
      await createPrescription(formData);
      router.push("/prescriptions");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8 font-heading">
              Enter eye measurement details
            </h1>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#1A1A1A] border-b pb-2">
                  Applicable service
                </h3>
                {loadingServices ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading
                    services...
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select service <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceId"
                      aria-label="Select service"
                      value={formData.serviceId}
                      onChange={handleChange}
                      required
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm bg-white"
                    >
                      <option value="">-- Select service --</option>
                      {services.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.name} ({svc.price.toLocaleString("en-US")} VND)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Frame measurements */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#1A1A1A] border-b pb-2">
                  Size & selection details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Temple
                    </label>
                    <input
                      aria-label="Temple"
                      type="text"
                      name="cangKinh"
                      value={formData.cangKinh}
                      onChange={handleChange}
                      placeholder="Enter size or type..."
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hinge
                    </label>
                    <input
                      aria-label="Hinge"
                      type="text"
                      name="banLe"
                      value={formData.banLe}
                      onChange={handleChange}
                      placeholder="Enter hinge type..."
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rim
                    </label>
                    <input
                      aria-label="Rim"
                      type="text"
                      name="vienGong"
                      value={formData.vienGong}
                      onChange={handleChange}
                      placeholder="Enter rim details..."
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nose pad
                    </label>
                    <input
                      aria-label="Nose pad"
                      type="text"
                      name="chanVeMui"
                      value={formData.chanVeMui}
                      onChange={handleChange}
                      placeholder="Enter nose pad details..."
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bridge
                    </label>
                    <input
                      aria-label="Bridge"
                      type="text"
                      name="cauGong"
                      value={formData.cauGong}
                      onChange={handleChange}
                      placeholder="Enter bridge size..."
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Temple tip
                    </label>
                    <input
                      aria-label="Temple tip"
                      type="text"
                      name="duoiGong"
                      value={formData.duoiGong}
                      onChange={handleChange}
                      placeholder="Enter temple tip details..."
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional notes
                </label>
                <textarea
                  name="note"
                  rows={4}
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Other frame requirements..."
                  className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none text-sm"
                />
              </div>

              {/* Submit */}
              <div className="pt-6 flex justify-end border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-8 rounded-full bg-[#D4AF37] text-white font-semibold flex items-center gap-2 hover:bg-[#C9A030] transition-colors disabled:opacity-50 hover:shadow-md"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Save measurement profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
