"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import {
  getPrescriptionById,
  updatePrescription,
  type PrescriptionDto,
} from "@/lib/api/prescription";
import { apiRequest, API } from "@/lib/api/client";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PrescriptionPending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PrescriptionConfirmed: {
    label: "Approved",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PrescriptionRejected: {
    label: "Rejected",
    color: "text-red-500",
    bg: "bg-red-50 border-red-100",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [prescription, setPrescription] = useState<PrescriptionDto | null>(
    null,
  );

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

  const isEditable = prescription?.status === "PrescriptionPending";

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!id) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [pres, svc] = await Promise.all([
          getPrescriptionById(id),
          apiRequest<ServiceOption[]>(API.services.getAll, { method: "GET" }),
        ]);

        setPrescription(pres);
        setServices(svc || []);
        setFormData({
          serviceId: pres.serviceId || "",
          cangKinh: pres.cangKinh || "",
          banLe: pres.banLe || "",
          vienGong: pres.vienGong || "",
          chanVeMui: pres.chanVeMui || "",
          cauGong: pres.cauGong || "",
          duoiGong: pres.duoiGong || "",
          note: pres.note || "",
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !isEditable) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.serviceId) {
        throw new Error("Please select an eye exam/fitting service.");
      }

      const updated = await updatePrescription(id, formData);
      setPrescription(updated);
      setSuccess("Prescription profile updated successfully.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const statusCfg = prescription
    ? STATUS_MAP[prescription.status] || {
        label: prescription.status,
        color: "text-[#6B7280]",
        bg: "bg-[#F5F5F5] border-[#E5E7EB]",
        icon: null,
      }
    : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/prescriptions"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to prescriptions
          </Link>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-[#6B7280] mb-4">{error}</p>
              <button
                onClick={() => router.refresh()}
                className="text-[#D4AF37] hover:underline font-medium text-sm"
              >
                Try again
              </button>
            </div>
          ) : prescription ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A] font-heading">
                    {isEditable
                      ? "Edit prescription profile"
                      : "Prescription details"}
                  </h1>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Created at {fmtDate(prescription.createdAt)}
                  </p>
                </div>
                {statusCfg && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color}`}
                  >
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                )}
              </div>

              {!isEditable && (
                <div className="mb-5 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#6B7280]">
                  This profile is no longer editable because it has been
                  processed.
                </div>
              )}

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    required
                    disabled={!isEditable || saving}
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm bg-white disabled:bg-gray-100"
                  >
                    <option value="">-- Select service --</option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} ({svc.price.toLocaleString("en-US")} VND)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      name: "cangKinh",
                      label: "Temple",
                      placeholder: "Enter size or type...",
                    },
                    {
                      name: "banLe",
                      label: "Hinge",
                      placeholder: "Enter hinge type...",
                    },
                    {
                      name: "vienGong",
                      label: "Rim",
                      placeholder: "Enter rim details...",
                    },
                    {
                      name: "chanVeMui",
                      label: "Nose pad",
                      placeholder: "Enter nose pad details...",
                    },
                    {
                      name: "cauGong",
                      label: "Bridge",
                      placeholder: "Enter bridge size...",
                    },
                    {
                      name: "duoiGong",
                      label: "Temple tip",
                      placeholder: "Enter temple tip details...",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        disabled={!isEditable || saving}
                        className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm disabled:bg-gray-100"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Additional notes..."
                    disabled={!isEditable || saving}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none text-sm disabled:bg-gray-100"
                  />
                </div>

                {isEditable && (
                  <div className="pt-6 flex justify-end border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="h-12 px-8 rounded-full bg-[#D4AF37] text-white font-semibold flex items-center gap-2 hover:bg-[#C9A030] transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
