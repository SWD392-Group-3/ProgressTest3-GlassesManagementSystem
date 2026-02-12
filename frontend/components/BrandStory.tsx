"use client";

import { Award, Truck, ShieldCheck, Headphones } from "lucide-react";

const values = [
  {
    icon: <Award className="w-6 h-6" />,
    title: "Premium Craftsmanship",
    description:
      "Every frame is handcrafted using the finest materials, from Japanese titanium to Italian acetate.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "2‑Year Warranty",
    description:
      "Full coverage against manufacturing defects. We stand behind every pair we create.",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Free Shipping & Returns",
    description:
      "Complimentary express shipping and hassle-free 30-day returns on every order.",
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "Optical Experts",
    description:
      "Our certified opticians are available 24/7 to help you find the perfect fit.",
  },
];

export default function BrandStory() {
  return (
    <section className="py-20 sm:py-28 bg-[#1A1A1A] text-white relative overflow-hidden">
      {/* Background decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37]">
            Why Elite Lens
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Crafted for Those Who{" "}
            <span className="text-[#D4AF37] italic">See More</span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto leading-relaxed">
            We believe eyewear is more than vision correction — it&apos;s a
            reflection of who you are. Every detail matters.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {values.map((v) => (
            <div
              key={v.title}
              className="group p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mb-5 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-300">
                {v.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
