"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterSystem, {
  type Filters,
  sortOptions,
} from "@/components/FilterSystem";
import ProductCard from "@/components/ProductCard";
import { getProducts, type ProductDto } from "@/lib/api/product";
import type { Product } from "@/constants/products";
import { Loader2 } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80";

/** Map backend ProductDto → frontend Product shape for ProductCard */
function mapProductDto(dto: ProductDto): Product {
  const variant = dto.productVariants[0];
  const image = dto.imageUrl ?? variant?.imageUrl ?? FALLBACK_IMAGE;
  return {
    id: dto.id,
    variantId: variant?.id ?? dto.id,
    name: dto.name,
    brand: dto.brand?.name ?? "Unknown",
    price: dto.unitPrice,
    image,
    images: [image],
    category: (dto.category?.name?.toLowerCase() ??
      "optical") as Product["category"],
    faceShape: [],
    material: (variant?.material?.toLowerCase() ??
      "acetate") as Product["material"],
    style: "classic" as Product["style"],
    color: variant?.color ?? "",
    rating: 4.5,
    reviewCount: 0,
    specs: {
      lensWidth: 0,
      bridgeWidth: 0,
      templeLength: 0,
      lensHeight: 0,
      weight: "",
    },
    description: dto.description ?? "",
  };
}

export default function ProductsPage() {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    faceShape: "",
    material: "",
    style: "",
    priceRange: [0, 9999],
    sortBy: "featured",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const dtos = await getProducts();
        setApiProducts(dtos.map(mapProductDto));
      } catch {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...apiProducts];

    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters.faceShape) {
      result = result.filter((p) =>
        p.faceShape.includes(
          filters.faceShape as "round" | "square" | "oval" | "heart",
        ),
      );
    }
    if (filters.material) {
      result = result.filter((p) => p.material === filters.material);
    }
    if (filters.style) {
      result = result.filter((p) => p.style === filters.style);
    }
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 9999) {
      result = result.filter(
        (p) =>
          p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [filters, apiProducts]);

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-10">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
              Collection
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              All Eyewear
            </h1>
            <p className="text-[#6B7280] mt-2">
              {loading
                ? "Loading..."
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} found`}
            </p>
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row gap-10">
            <FilterSystem filters={filters} onFilterChange={setFilters} />

            <div className="flex-1">
              {/* Desktop Sort */}
              <div className="hidden lg:flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[#6B7280]">
                  Sort:
                </span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setFilters((f) => ({ ...f, sortBy: opt.value }))
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      filters.sortBy === opt.value
                        ? "bg-[#1A1A1A] text-white"
                        : "text-[#6B7280] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="text-center py-20">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Product Grid */}
              {!loading &&
                !error &&
                (filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 stagger-children">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🕶️</div>
                    <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                      No frames found
                    </h3>
                    <p className="text-[#6B7280] mb-6">
                      Try adjusting your filters to discover more styles.
                    </p>
                    <button
                      onClick={() =>
                        setFilters({
                          category: "",
                          faceShape: "",
                          material: "",
                          style: "",
                          priceRange: [0, 9999],
                          sortBy: "featured",
                        })
                      }
                      className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
