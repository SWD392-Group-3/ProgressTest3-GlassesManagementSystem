"use client";

import ProductCard from "./ProductCard";
import type { Product } from "@/constants/products";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export default function ProductGrid({
  products,
  title,
  subtitle,
  loading = false,
}: ProductGridProps) {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {title && (
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
              Handpicked for You
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mt-3 mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[#6B7280] max-w-md mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[#F5F5F5] animate-pulse">
                  <div className="aspect-square rounded-t-2xl bg-[#E5E5E5]" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-[#E5E5E5] rounded w-1/3" />
                    <div className="h-4 bg-[#E5E5E5] rounded w-2/3" />
                    <div className="h-4 bg-[#E5E5E5] rounded w-1/4" />
                  </div>
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}
