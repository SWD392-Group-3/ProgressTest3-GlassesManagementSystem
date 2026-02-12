"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const footerLinks = {
  Shop: [
    { name: "Sunglasses", href: "/products?category=sunglasses" },
    { name: "Optical Frames", href: "/products?category=optical" },
    { name: "Blue-Light Glasses", href: "/products?category=blue-light" },
    { name: "Sport Eyewear", href: "/products?category=sport" },
    { name: "New Arrivals", href: "/products" },
  ],
  Support: [
    { name: "Size Guide", href: "#" },
    { name: "Virtual Try-On", href: "#" },
    { name: "Prescription Help", href: "#" },
    { name: "Shipping & Returns", href: "#" },
    { name: "FAQ", href: "#" },
  ],
  Company: [
    { name: "Our Story", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact Us", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="py-12 sm:py-16 border-b border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Stay in <span className="text-[#D4AF37] italic">Focus</span>
              </h3>
              <p className="text-sm text-white/50">
                Be the first to know about new collections and exclusive offers.
              </p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-72 h-12 px-5 rounded-l-full bg-white/10 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button className="h-12 px-6 rounded-r-full bg-[#D4AF37] text-white text-sm font-semibold hover:bg-[#C9A030] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ELITE<span className="text-[#D4AF37]"> LENS</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Premium eyewear crafted for those who see beyond the ordinary.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-white/70 mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-[#D4AF37] transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © 2026 Elite Lens. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>Ho Chi Minh City, Vietnam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
