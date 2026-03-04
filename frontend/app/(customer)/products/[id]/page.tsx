"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LensSelector from "@/components/LensSelector";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/constants/products";
import {
  getProductById,
  getProducts,
  mapProductDtoToProduct,
} from "@/lib/api/product";
import { useCart } from "@/lib/CartContext";
import { getUser } from "@/lib/auth-storage";
import {
  Star,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLensSelector, setShowLensSelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCart();
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    async function fetchProduct() {
      setPageLoading(true);
      const dto = await getProductById(id);
      if (!dto) {
        setProduct(null);
        setPageLoading(false);
        return;
      }
      const mapped = mapProductDtoToProduct(dto);
      setProduct(mapped);

      // Fetch related products (same category, exclude current)
      try {
        const allDtos = await getProducts();
        const related = allDtos
          .map(mapProductDtoToProduct)
          .filter((p) => p.id !== id && p.category === mapped.category)
          .slice(0, 3);
        setRelatedProducts(related);
      } catch {
        // silent fail
      }
      setPageLoading(false);
    }
    fetchProduct();
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    try {
      await addItem({ productVariantId: product.variantId, quantity });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAddingToCart(false);
    }
  }

  function handleBuyNow() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!product) return;
    // Truyền thông tin sang trang buy-now qua query params
    router.push(
      `/checkout/buy-now?productId=${product.variantId}&qty=${quantity}&price=${product.price}&name=${encodeURIComponent(product.name)}`,
    );
  }

  if (pageLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Product not found
          </h1>
          <Link
            href="/products"
            className="text-[#D4AF37] hover:underline mt-4 inline-block"
          >
            ← Back to collection
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link
              href="/"
              className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#6B7280]">/</span>
            <Link
              href="/products"
              className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
            >
              Collection
            </Link>
            <span className="text-[#6B7280]">/</span>
            <span className="text-[#1A1A1A] font-medium">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left — Images */}
            <div className="animate-fade-in">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5] mb-4">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
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
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i
                          ? "border-[#D4AF37]"
                          : "border-transparent hover:border-[#E5E7EB]"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Product Info */}
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D4AF37]">
                  {product.brand}
                </span>
                {product.originalPrice && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-500 rounded-full">
                    SAVE ${product.originalPrice - product.price}
                  </span>
                )}
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-[#D4AF37] text-[#D4AF37]"
                          : "fill-[#E5E7EB] text-[#E5E7EB]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {product.rating}
                </span>
                <span className="text-sm text-[#6B7280]">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-[#1A1A1A]">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-[#6B7280] line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[#6B7280] leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Quick Specs */}
              <div className="mb-8">
                <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#6B7280] mb-3">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Lens Width",
                      value: `${product.specs.lensWidth}mm`,
                    },
                    {
                      label: "Bridge",
                      value: `${product.specs.bridgeWidth}mm`,
                    },
                    {
                      label: "Temple",
                      value: `${product.specs.templeLength}mm`,
                    },
                    {
                      label: "Lens Height",
                      value: `${product.specs.lensHeight}mm`,
                    },
                    { label: "Weight", value: product.specs.weight },
                    {
                      label: "Material",
                      value:
                        product.material.charAt(0).toUpperCase() +
                        product.material.slice(1),
                    },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="bg-[#F5F5F5] rounded-xl p-3"
                    >
                      <div className="text-[10px] font-semibold tracking-wider uppercase text-[#6B7280]">
                        {spec.label}
                      </div>
                      <div className="text-sm font-semibold text-[#1A1A1A] mt-0.5">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#6B7280] mb-3">
                  Số lượng
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E5E7EB] rounded-full overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors text-[#1A1A1A]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors text-[#1A1A1A]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-[#6B7280]">Còn hàng</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mb-8">
                {/* Mua ngay */}
                <button
                  onClick={handleBuyNow}
                  className="w-full h-14 rounded-full bg-[#1A1A1A] text-white font-semibold text-sm tracking-wide hover:bg-[#333] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  Mua ngay
                </button>

                {/* Thêm vào giỏ */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`w-full h-14 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-[#D4AF37] text-white hover:bg-[#C9A030]"
                  } disabled:opacity-70`}
                >
                  {addingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Đã thêm vào giỏ!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Thêm vào giỏ hàng
                    </>
                  )}
                </button>

                {/* Chọn tròng kính */}
                <button
                  onClick={() => setShowLensSelector(!showLensSelector)}
                  className="w-full h-12 rounded-full border-2 border-[#E5E7EB] text-[#1A1A1A] text-sm font-medium flex items-center justify-center gap-2 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                >
                  {showLensSelector
                    ? "Ẩn tuỳ chọn tròng"
                    : "Chọn tròng kính (tuỳ chọn)"}
                </button>

                <div className="flex gap-3">
                  <button className="flex-1 h-11 rounded-full border-2 border-[#E5E7EB] text-[#1A1A1A] text-sm font-medium flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </button>
                  <button className="flex-1 h-11 rounded-full border-2 border-[#E5E7EB] text-[#1A1A1A] text-sm font-medium flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Lens Selector */}
              {showLensSelector && (
                <div className="animate-slide-up mb-8">
                  <LensSelector basePrice={product.price} />
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#E5E7EB]">
                {[
                  {
                    icon: <Truck className="w-4 h-4" />,
                    text: "Free Express Shipping",
                  },
                  {
                    icon: <RotateCcw className="w-4 h-4" />,
                    text: "30‑Day Returns",
                  },
                  {
                    icon: <ShieldCheck className="w-4 h-4" />,
                    text: "2‑Year Warranty",
                  },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2">
                    <div className="text-[#D4AF37]">{badge.icon}</div>
                    <span className="text-xs font-medium text-[#6B7280]">
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20 sm:mt-28">
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-8"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
