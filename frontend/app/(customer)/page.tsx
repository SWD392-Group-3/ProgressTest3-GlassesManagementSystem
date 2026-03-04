"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import ProductGrid from "@/components/ProductGrid";
import BrandStory from "@/components/BrandStory";
import Footer from "@/components/Footer";
import type { Product } from "@/constants/products";
import { getProducts, mapProductDtoToProduct } from "@/lib/api/product";
import Link from "next/link";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const dtos = await getProducts();
        const all = dtos.map(mapProductDtoToProduct);
        // Lấy 6 sản phẩm đầu làm Bestsellers, 6 tiếp theo làm New Arrivals
        setFeaturedProducts(all.slice(0, 6));
        setNewArrivals(all.slice(6, 12));
      } catch {
        // silent — home page degrades gracefully
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <ProductGrid
          products={featuredProducts}
          loading={loading}
          title="Bestsellers"
          subtitle="Our most loved frames, chosen by thousands of style-conscious customers."
        />

        {/* CTA Banner */}
        <section className="py-16 sm:py-20 bg-[#F5F5F5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
              Innovation
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-3 mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Try Before You Buy
            </h2>
            <p className="text-[#6B7280] max-w-lg mx-auto mb-8">
              Use our AI-powered Virtual Try-On to see how any frame looks on
              your face. No mirror needed.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-full bg-[#D4AF37] text-white font-semibold text-sm tracking-wide hover:bg-[#C9A030] transition-colors duration-300"
            >
              Try It Now — It&apos;s Free
            </Link>
          </div>
        </section>

        <ProductGrid
          products={newArrivals}
          loading={loading}
          title="New Arrivals"
          subtitle="The latest additions to our collection — fresh designs for the new season."
        />
        <BrandStory />
      </main>
      <Footer />
    </>
  );
}
