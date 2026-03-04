"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import {
  getProduct,
  getProducts,
  type ProductDto,
  type ProductVariantDto,
} from "@/lib/api/product";
import type { Product } from "@/constants/products";
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
  ArrowLeft,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80";

/** Map backend ProductDto → frontend Product shape (dùng cho Related products) */
function mapProductDto(dto: ProductDto): Product {
  const variant = dto.productVariants[0];
  const variantImages = dto.productVariants
    .map((v) => v.imageUrl)
    .filter((url): url is string => !!url);
  const allImages = [...(dto.imageUrl ? [dto.imageUrl] : []), ...variantImages];
  const images = allImages.length > 0 ? allImages : [FALLBACK_IMAGE];

  return {
    id: dto.id,
    variantId: variant?.id ?? dto.id,
    name: dto.name,
    brand: dto.brand?.name ?? "Unknown",
    price: dto.unitPrice, // ← UnitPrice của product
    image: images[0],
    images,
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

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [dto, setDto] = useState<ProductDto | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantDto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setSelectedVariant(null);
    getProduct(id)
      .then((data) => {
        setDto(data);
        if (data.productVariants.length > 0) {
          setSelectedVariant(data.productVariants[0]);
        }
        // Fetch related
        return getProducts().then((all) => {
          const related = all
            .filter((p) => p.id !== data.id && p.categoryId === data.categoryId)
            .slice(0, 3)
            .map(mapProductDto);
          setRelatedProducts(related);
        });
      })
      .catch(() => setDto(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!dto) return;
    // Nếu có biến thể nhưng chưa chọn → bắt chọn
    if (hasVariants && !selectedVariant) return;

    setAddingToCart(true);
    try {
      if (selectedVariant) {
        // Sản phẩm có biến thể → dùng productVariantId
        await addItem({ productVariantId: selectedVariant.id, quantity });
      } else {
        // Sản phẩm không có biến thể → dùng productId
        await addItem({ productId: dto.id, quantity });
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAddingToCart(false);
    }
  }

  function handleBuyNow() {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!dto) return;
    if (hasVariants && !selectedVariant) return;

    const price =
      selectedVariant && selectedVariant.price > 0
        ? selectedVariant.price
        : dto.unitPrice;

    if (selectedVariant) {
      // Có biến thể → truyền variantId
      router.push(
        `/checkout/buy-now?productVariantId=${selectedVariant.id}&qty=${quantity}&price=${price}&name=${encodeURIComponent(dto.name)}`,
      );
    } else {
      // Không có biến thể → truyền productId
      router.push(
        `/checkout/buy-now?productId=${dto.id}&qty=${quantity}&price=${price}&name=${encodeURIComponent(dto.name)}`,
      );
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!dto) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Không tìm thấy sản phẩm
          </h1>
          <Link
            href="/products"
            className="text-[#D4AF37] hover:underline mt-4 inline-block"
          >
            ← Quay lại bộ sưu tập
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Derived data ──────────────────────────────────────────────────────────
  const allImages = [
    ...(dto.imageUrl ? [dto.imageUrl] : []),
    ...dto.productVariants
      .map((v) => v.imageUrl)
      .filter((u): u is string => !!u),
  ];
  const displayImages = allImages.length > 0 ? allImages : [FALLBACK_IMAGE];

  // Group variants by color
  const colorMap = new Map<string, ProductVariantDto[]>();
  for (const v of dto.productVariants) {
    const key = v.color ?? "Default";
    if (!colorMap.has(key)) colorMap.set(key, []);
    colorMap.get(key)!.push(v);
  }

  // Sizes available for the currently selected color
  const sizesForColor = selectedVariant
    ? (colorMap.get(selectedVariant.color ?? "Default") ?? [])
    : [];

  // Display price: variant price if > 0, else product unitPrice
  const displayPrice =
    selectedVariant && selectedVariant.price > 0
      ? selectedVariant.price
      : dto.unitPrice;

  const hasVariants = dto.productVariants.length > 0;

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link
              href="/products"
              className="flex items-center gap-1 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Bộ sưu tập
            </Link>
            <span className="text-[#6B7280]">/</span>
            <span className="text-[#1A1A1A] font-medium">{dto.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* ─── LEFT: Images ─────────────────────────────────────────────── */}
            <div className="animate-fade-in">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5] mb-4">
                <Image
                  src={displayImages[selectedImage] ?? FALLBACK_IMAGE}
                  alt={dto.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
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

            {/* ─── RIGHT: Info ───────────────────────────────────────────────── */}
            <div className="animate-slide-up flex flex-col">
              {/* Brand */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D4AF37]">
                  {dto.brand?.name ?? "Elite Lens"}
                </span>
                {dto.category && (
                  <span className="px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[10px] text-[#6B7280]">
                    {dto.category.name}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {dto.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? "fill-[#D4AF37] text-[#D4AF37]" : "fill-[#E5E7EB] text-[#E5E7EB]"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">4.5</span>
                <span className="text-sm text-[#6B7280]">(0 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-[#1A1A1A]">
                  {displayPrice.toLocaleString("vi-VN")}₫
                </span>
                {/* Hiển thị unitPrice gốc nếu variant có giá khác */}
                {selectedVariant &&
                  selectedVariant.price > 0 &&
                  selectedVariant.price !== dto.unitPrice && (
                    <span className="text-base text-[#6B7280] line-through">
                      {dto.unitPrice.toLocaleString("vi-VN")}₫
                    </span>
                  )}
              </div>

              {/* Base price note */}
              <p className="text-xs text-[#6B7280] mb-6">
                Giá niêm yết:{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  {dto.unitPrice.toLocaleString("vi-VN")}₫
                </span>
                {selectedVariant &&
                  selectedVariant.price > 0 &&
                  selectedVariant.price !== dto.unitPrice && (
                    <span>
                      {" "}
                      · Giá variant đã chọn:{" "}
                      <span className="text-[#D4AF37] font-semibold">
                        {selectedVariant.price.toLocaleString("vi-VN")}₫
                      </span>
                    </span>
                  )}
              </p>

              {/* Description */}
              {dto.description && (
                <p className="text-[#6B7280] leading-relaxed mb-6 text-sm">
                  {dto.description}
                </p>
              )}

              {/* ─── Variant Selector ──────────────────────────────────────── */}
              {hasVariants ? (
                <div className="space-y-5 mb-6">
                  {/* Color */}
                  {colorMap.size > 0 && (
                    <div>
                      <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#6B7280] mb-2.5">
                        Màu sắc:{" "}
                        <span className="text-[#1A1A1A] font-semibold normal-case tracking-normal">
                          {selectedVariant?.color ?? "—"}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(colorMap.keys()).map((color) => {
                          const variants = colorMap.get(color)!;
                          const isSelected =
                            selectedVariant?.color === color ||
                            (!selectedVariant?.color && color === "Default");
                          return (
                            <button
                              key={color}
                              onClick={() => {
                                const v = variants[0];
                                setSelectedVariant(v);
                                if (v.imageUrl) {
                                  const idx = displayImages.indexOf(v.imageUrl);
                                  if (idx >= 0) setSelectedImage(idx);
                                }
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${
                                isSelected
                                  ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-sm"
                                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                              }`}
                            >
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size (chỉ hiện nếu có nhiều size cho cùng màu) */}
                  {sizesForColor.length > 1 && (
                    <div>
                      <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#6B7280] mb-2.5">
                        Kích thước:{" "}
                        <span className="text-[#1A1A1A] font-semibold normal-case tracking-normal">
                          {selectedVariant?.size ?? "—"}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sizesForColor.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${
                              selectedVariant?.id === v.id
                                ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-sm"
                                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                            }`}
                          >
                            {v.size ?? "Standard"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material info */}
                  {selectedVariant?.material && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-bold tracking-[0.1em] uppercase text-[#6B7280]">
                        Chất liệu:
                      </span>
                      <span className="text-[#1A1A1A] font-medium">
                        {selectedVariant.material}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#6B7280]">
                  Sản phẩm này không có biến thể — bạn có thể mua trực tiếp.
                </div>
              )}

              {/* Quantity */}
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
                  disabled={hasVariants && !selectedVariant}
                  className="w-full h-14 rounded-full bg-[#1A1A1A] text-white font-semibold text-sm tracking-wide hover:bg-[#333] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  Mua ngay
                </button>

                {/* Thêm vào giỏ */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || (hasVariants && !selectedVariant)}
                  className={`w-full h-14 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-[#D4AF37] text-white hover:bg-[#C9A030]"
                  } disabled:opacity-60`}
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

                {/* Helper text nếu chưa chọn variant */}
                {hasVariants && !selectedVariant && (
                  <p className="text-xs text-center text-red-500">
                    Vui lòng chọn màu sắc trước khi thêm vào giỏ
                  </p>
                )}

                <div className="flex gap-3">
                  <button className="flex-1 h-11 rounded-full border-2 border-[#E5E7EB] text-[#1A1A1A] text-sm font-medium flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </button>
                  <button className="flex-1 h-11 rounded-full border-2 border-[#E5E7EB] text-[#1A1A1A] text-sm font-medium flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#E5E7EB]">
                {[
                  {
                    icon: <Truck className="w-4 h-4" />,
                    text: "Giao hàng toàn quốc",
                  },
                  {
                    icon: <RotateCcw className="w-4 h-4" />,
                    text: "Đổi trả 30 ngày",
                  },
                  {
                    icon: <ShieldCheck className="w-4 h-4" />,
                    text: "Bảo hành 2 năm",
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
                Có thể bạn thích
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
