"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Eye } from "lucide-react";
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

        {/* Virtual Try-On Button (appears on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-sm font-medium shadow-lg hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
            Virtual Try-On
          </button>
        </div>
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
          · {product.style.charAt(0).toUpperCase() + product.style.slice(1)} ·{" "}
          {product.color}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#1A1A1A]">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[#6B7280] line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
