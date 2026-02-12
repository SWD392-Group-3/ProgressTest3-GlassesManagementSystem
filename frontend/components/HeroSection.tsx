"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F5F5F5]">
      {/* Background subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-5rem)] py-24">
          {/* Left — Text Content */}
          <div className="animate-slide-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-[#E5E7EB] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-xs font-medium tracking-wider uppercase text-[#6B7280]">
                New Collection 2026
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-[#1A1A1A] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              See the World
              <br />
              Through <span className="text-[#D4AF37] italic">Luxury</span>
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] max-w-lg mb-8 leading-relaxed">
              Handcrafted frames. Premium lenses. Each pair is a statement of
              refined taste and uncompromising quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-8 rounded-full bg-[#1A1A1A] text-white font-medium text-sm sm:text-base tracking-wide hover:bg-[#333] transition-all duration-300"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/products?category=sunglasses"
                className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-8 rounded-full border-2 border-[#1A1A1A] text-[#1A1A1A] font-medium text-sm sm:text-base tracking-wide hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
              >
                Virtual Try-On
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8 sm:gap-12 mt-12 pt-8 border-t border-[#E5E7EB]">
              {[
                { number: "500+", label: "Premium Frames" },
                { number: "50K+", label: "Happy Customers" },
                { number: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                    {stat.number}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative animate-slide-right order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=85"
                alt="Elite Lens Premium Eyewear"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-6 glass rounded-2xl px-5 py-4 shadow-lg">
              <div className="text-xs text-[#6B7280] mb-1">Bestseller</div>
              <div className="text-sm font-semibold text-[#1A1A1A]">
                Aurora Titanium
              </div>
              <div className="text-sm font-bold text-[#D4AF37] mt-0.5">
                $289
              </div>
            </div>

            {/* Decorative circle */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-2 border-[#D4AF37]/20 hidden lg:block" />
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full border border-[#D4AF37]/10 hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
