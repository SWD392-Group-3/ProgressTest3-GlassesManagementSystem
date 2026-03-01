"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { faceShapes, materials, styles } from "@/constants/products";

export interface Filters {
  category: string;
  faceShape: string;
  material: string;
  style: string;
  priceRange: [number, number];
  sortBy: string;
}

interface FilterSystemProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const priceRanges: { label: string; value: [number, number] }[] = [
  { label: "All Prices", value: [0, 9999] },
  { label: "Under $200", value: [0, 200] },
  { label: "$200 — $300", value: [200, 300] },
  { label: "Over $300", value: [300, 9999] },
];

export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

interface FilterContentProps {
  filters: Filters;
  updateFilter: (key: keyof Filters, value: string | [number, number]) => void;
  activeCount: number;
  clearAll: () => void;
}

function FilterContent({
  filters,
  updateFilter,
  activeCount,
  clearAll,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Face Shape */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#6B7280] mb-3">
          Face Shape
        </h4>
        <div className="flex flex-wrap gap-2">
          {faceShapes.map((shape) => (
            <button
              key={shape.value}
              onClick={() =>
                updateFilter(
                  "faceShape",
                  filters.faceShape === shape.value ? "" : shape.value,
                )
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.faceShape === shape.value
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E7EB]"
              }`}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#6B7280] mb-3">
          Material
        </h4>
        <div className="flex flex-wrap gap-2">
          {materials.map((mat) => (
            <button
              key={mat.value}
              onClick={() =>
                updateFilter(
                  "material",
                  filters.material === mat.value ? "" : mat.value,
                )
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.material === mat.value
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E7EB]"
              }`}
            >
              {mat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#6B7280] mb-3">
          Style
        </h4>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s.value}
              onClick={() =>
                updateFilter("style", filters.style === s.value ? "" : s.value)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.style === s.value
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E7EB]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#6B7280] mb-3">
          Price
        </h4>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => updateFilter("priceRange", range.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.priceRange[0] === range.value[0] &&
                filters.priceRange[1] === range.value[1]
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E7EB]"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-[#D4AF37] hover:underline font-medium"
        >
          Clear all filters ({activeCount})
        </button>
      )}
    </div>
  );
}

export default function FilterSystem({
  filters,
  onFilterChange,
}: FilterSystemProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = (
    key: keyof Filters,
    value: string | [number, number],
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeCount = [
    filters.faceShape !== "",
    filters.material !== "",
    filters.style !== "",
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 9999,
  ].filter(Boolean).length;

  const clearAll = () => {
    onFilterChange({
      category: filters.category,
      faceShape: "",
      material: "",
      style: "",
      priceRange: [0, 9999],
      sortBy: "featured",
    });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#1A1A1A]">
              Filters
            </h3>
            <SlidersHorizontal className="w-4 h-4 text-[#6B7280]" />
          </div>
          <FilterContent
            filters={filters}
            updateFilter={updateFilter}
            activeCount={activeCount}
            clearAll={clearAll}
          />
        </div>
      </aside>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F5F5F5] text-sm font-medium text-[#1A1A1A] hover:bg-[#E5E7EB] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="px-4 py-2.5 rounded-full bg-[#F5F5F5] text-sm font-medium text-[#1A1A1A] appearance-none cursor-pointer focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-[#F5F5F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent
              filters={filters}
              updateFilter={updateFilter}
              activeCount={activeCount}
              clearAll={clearAll}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full mt-6 h-12 rounded-full bg-[#1A1A1A] text-white font-medium text-sm tracking-wide hover:bg-[#333] transition-colors"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
