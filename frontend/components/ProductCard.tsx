"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import type { Product } from "@/constants/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-black/8 border border-transparent hover:border-[#D4AF37]/30"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F5F5]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#D4AF37] text-white rounded-full">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#1A1A1A] text-white rounded-full">
              Bestseller
            </span>
          )}
          {product.originalPrice && (
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-red-500 text-white rounded-full">
              Sale
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#6B7280]">
            {product.brand}
          </span>
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#1A1A1A]">
              {product.rating}
            </span>
            <span className="text-[10px] text-[#6B7280]">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors duration-300 mb-1">
          {product.name}
        </h3>

        <p className="text-xs text-[#6B7280] mb-3 line-clamp-1">
          {product.material.charAt(0).toUpperCase() + product.material.slice(1)}{" "}
          · {product.style.charAt(0).toUpperCase() + product.style.slice(1)}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-bold text-[#1A1A1A]">
            {product.price.toLocaleString("vi-VN")}₫
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[#6B7280] line-through">
              {product.originalPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="w-full h-10 rounded-full text-xs font-semibold tracking-wide flex items-center justify-center gap-2 bg-[#1A1A1A] text-white group-hover:bg-[#D4AF37] transition-colors duration-300">
          Chọn kiểu dáng
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
