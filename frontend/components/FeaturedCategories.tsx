"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/constants/products";
import { ArrowUpRight } from "lucide-react";

export default function FeaturedCategories() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
            Categories
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mt-3 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Find Your Style
          </h2>
          <p className="text-[#6B7280] max-w-md mx-auto">
            Browse our curated collections designed for every occasion and
            personality.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      {cat.description}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#D4AF37] transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
