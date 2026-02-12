"use client";

import { useState } from "react";
import { Check, ChevronRight, Shield, Sun, Eye, Sparkles } from "lucide-react";

interface LensOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
}

const lensTypes: LensOption[] = [
  {
    id: "clear",
    name: "Clear Lenses",
    description: "Standard optical lenses with anti-scratch coating",
    price: 0,
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "blue-light",
    name: "Blue-Light Filter",
    description: "Block harmful blue light from screens",
    price: 49,
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "photochromic",
    name: "Photochromic",
    description: "Auto-darken in sunlight, clear indoors",
    price: 79,
    icon: <Sun className="w-5 h-5" />,
  },
  {
    id: "prescription",
    name: "Prescription",
    description: "Custom prescription lenses — enter Rx at checkout",
    price: 99,
    icon: <Sparkles className="w-5 h-5" />,
  },
];

const coatings: LensOption[] = [
  {
    id: "anti-reflective",
    name: "Anti-Reflective",
    description: "Reduce glare for crystal-clear vision",
    price: 29,
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "uv-protection",
    name: "UV Protection",
    description: "100% UV400 protection from harmful rays",
    price: 19,
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "hydrophobic",
    name: "Hydrophobic",
    description: "Water & oil-repellent for easy cleaning",
    price: 25,
    icon: <Eye className="w-5 h-5" />,
  },
];

interface LensSelectorProps {
  basePrice: number;
  onComplete?: (selection: {
    lensType: string;
    coatings: string[];
    totalExtra: number;
  }) => void;
}

export default function LensSelector({
  basePrice,
  onComplete,
}: LensSelectorProps) {
  const [step, setStep] = useState(0);
  const [selectedLens, setSelectedLens] = useState<string>("");
  const [selectedCoatings, setSelectedCoatings] = useState<string[]>([]);

  const steps = ["Lens Type", "Coatings", "Review"];

  const toggleCoating = (id: string) => {
    setSelectedCoatings((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const lensExtra = lensTypes.find((l) => l.id === selectedLens)?.price ?? 0;
  const coatingExtra = selectedCoatings.reduce(
    (sum, id) => sum + (coatings.find((c) => c.id === id)?.price ?? 0),
    0,
  );
  const totalPrice = basePrice + lensExtra + coatingExtra;

  const handleComplete = () => {
    onComplete?.({
      lensType: selectedLens,
      coatings: selectedCoatings,
      totalExtra: lensExtra + coatingExtra,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Progress Steps */}
      <div className="flex items-center border-b border-[#E5E7EB]">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => {
              if (i === 0) setStep(0);
              if (i === 1 && selectedLens) setStep(1);
              if (i === 2 && selectedLens) setStep(2);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              step === i
                ? "text-[#D4AF37] border-b-2 border-[#D4AF37]"
                : step > i
                  ? "text-[#1A1A1A]"
                  : "text-[#6B7280]"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > i
                  ? "bg-[#D4AF37] text-white"
                  : step === i
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F5F5F5] text-[#6B7280]"
              }`}
            >
              {step > i ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {/* Step 1: Lens Type */}
        {step === 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Choose Your Lens Type
            </h3>
            {lensTypes.map((lens) => (
              <button
                key={lens.id}
                onClick={() => setSelectedLens(lens.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                  selectedLens === lens.id
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedLens === lens.id ? "bg-[#D4AF37]" : "bg-white"
                  }`}
                >
                  {lens.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{lens.name}</div>
                  <div
                    className={`text-xs mt-0.5 ${selectedLens === lens.id ? "text-white/70" : "text-[#6B7280]"}`}
                  >
                    {lens.description}
                  </div>
                </div>
                <div className="text-sm font-bold">
                  {lens.price === 0 ? "Free" : `+$${lens.price}`}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Coatings */}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Add Coatings{" "}
              <span className="text-sm font-normal text-[#6B7280]">
                (optional)
              </span>
            </h3>
            {coatings.map((coating) => (
              <button
                key={coating.id}
                onClick={() => toggleCoating(coating.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                  selectedCoatings.includes(coating.id)
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedCoatings.includes(coating.id)
                      ? "bg-[#D4AF37]"
                      : "bg-white"
                  }`}
                >
                  {coating.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{coating.name}</div>
                  <div
                    className={`text-xs mt-0.5 ${selectedCoatings.includes(coating.id) ? "text-white/70" : "text-[#6B7280]"}`}
                  >
                    {coating.description}
                  </div>
                </div>
                <div className="text-sm font-bold">+${coating.price}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Review Your Selection
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                <span className="text-sm text-[#6B7280]">Frame</span>
                <span className="text-sm font-semibold">${basePrice}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                <span className="text-sm text-[#6B7280]">
                  Lens: {lensTypes.find((l) => l.id === selectedLens)?.name}
                </span>
                <span className="text-sm font-semibold">
                  {lensExtra === 0 ? "Free" : `+$${lensExtra}`}
                </span>
              </div>
              {selectedCoatings.map((id) => {
                const c = coatings.find((c) => c.id === id);
                return c ? (
                  <div
                    key={id}
                    className="flex justify-between items-center py-2 border-b border-[#E5E7EB]"
                  >
                    <span className="text-sm text-[#6B7280]">{c.name}</span>
                    <span className="text-sm font-semibold">+${c.price}</span>
                  </div>
                ) : null;
              })}
              <div className="flex justify-between items-center py-3">
                <span className="text-base font-bold text-[#1A1A1A]">
                  Total
                </span>
                <span className="text-xl font-bold text-[#D4AF37]">
                  ${totalPrice}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 rounded-full border-2 border-[#E5E7EB] text-[#1A1A1A] font-medium text-sm hover:border-[#1A1A1A] transition-colors"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !selectedLens}
              className="flex-1 h-12 rounded-full bg-[#1A1A1A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex-1 h-12 rounded-full bg-[#D4AF37] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#C9A030] transition-colors"
            >
              Add to Cart — ${totalPrice}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
