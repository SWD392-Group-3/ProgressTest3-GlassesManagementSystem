export interface Product {
  id: string;
  /** UUID của ProductVariant trong database — dùng khi gọi API */
  variantId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: "sunglasses" | "optical" | "blue-light" | "sport";
  faceShape: ("round" | "square" | "oval" | "heart")[];
  material: "titanium" | "acetate" | "metal" | "tr90";
  style: "classic" | "modern" | "aviator" | "cat-eye" | "round" | "rectangular";
  color: string;
  isNew?: boolean;
  isBestseller?: boolean;
  rating: number;
  reviewCount: number;
  specs: {
    lensWidth: number;
    bridgeWidth: number;
    templeLength: number;
    lensHeight: number;
    weight: string;
  };
  description: string;
}

export const products: Product[] = [
  {
    id: "el-001",
    variantId: "ee200001-0000-0000-0000-000000000001",
    name: "Aurora Titanium",
    brand: "Elite Lens",
    price: 289,
    originalPrice: 349,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80",
    ],
    category: "optical",
    faceShape: ["oval", "square"],
    material: "titanium",
    style: "modern",
    color: "Gunmetal",
    isNew: true,
    rating: 4.8,
    reviewCount: 124,
    specs: {
      lensWidth: 52,
      bridgeWidth: 18,
      templeLength: 145,
      lensHeight: 35,
      weight: "12g",
    },
    description:
      "Ultra-lightweight titanium frame with a sleek modern silhouette. Perfect for all-day comfort and effortless elegance.",
  },
  {
    id: "el-002",
    variantId: "ee200002-0000-0000-0000-000000000002",
    name: "Noir Classic",
    brand: "Elite Lens",
    price: 219,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
    ],
    category: "sunglasses",
    faceShape: ["round", "oval"],
    material: "acetate",
    style: "classic",
    color: "Matte Black",
    isBestseller: true,
    rating: 4.9,
    reviewCount: 287,
    specs: {
      lensWidth: 54,
      bridgeWidth: 20,
      templeLength: 140,
      lensHeight: 45,
      weight: "28g",
    },
    description:
      "Timeless black acetate sunglasses with premium polarized lenses. An icon of understated luxury.",
  },
  {
    id: "el-003",
    variantId: "ee200003-0000-0000-0000-000000000003",
    name: "Crystal Blue Shield",
    brand: "Elite Lens",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80",
    ],
    category: "blue-light",
    faceShape: ["square", "heart"],
    material: "tr90",
    style: "rectangular",
    color: "Crystal Clear",
    isNew: true,
    rating: 4.7,
    reviewCount: 89,
    specs: {
      lensWidth: 51,
      bridgeWidth: 17,
      templeLength: 142,
      lensHeight: 33,
      weight: "18g",
    },
    description:
      "Advanced blue-light filtering lenses in a minimalist TR-90 frame. Designed for digital professionals.",
  },
  {
    id: "el-004",
    variantId: "ee200004-0000-0000-0000-000000000004",
    name: "Riviera Aviator",
    brand: "Elite Lens",
    price: 329,
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
    ],
    category: "sunglasses",
    faceShape: ["oval", "heart", "square"],
    material: "metal",
    style: "aviator",
    color: "Gold",
    isBestseller: true,
    rating: 4.9,
    reviewCount: 312,
    specs: {
      lensWidth: 58,
      bridgeWidth: 14,
      templeLength: 135,
      lensHeight: 50,
      weight: "22g",
    },
    description:
      "A modern take on the classic aviator. Gold-plated metal frame with gradient brown lenses for timeless appeal.",
  },
  {
    id: "el-005",
    variantId: "ee200005-0000-0000-0000-000000000005",
    name: "Vogue Cat-Eye",
    brand: "Elite Lens",
    price: 259,
    image:
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80",
    ],
    category: "optical",
    faceShape: ["round", "oval", "heart"],
    material: "acetate",
    style: "cat-eye",
    color: "Tortoise",
    rating: 4.6,
    reviewCount: 156,
    specs: {
      lensWidth: 53,
      bridgeWidth: 16,
      templeLength: 140,
      lensHeight: 40,
      weight: "24g",
    },
    description:
      "Bold tortoise acetate cat-eye frames that command attention. A fusion of vintage glamour and modern sophistication.",
  },
  {
    id: "el-006",
    variantId: "ee200006-0000-0000-0000-000000000006",
    name: "Zen Round",
    brand: "Elite Lens",
    price: 239,
    image:
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&q=80",
    ],
    category: "optical",
    faceShape: ["square", "heart"],
    material: "titanium",
    style: "round",
    color: "Rose Gold",
    rating: 4.7,
    reviewCount: 98,
    specs: {
      lensWidth: 48,
      bridgeWidth: 21,
      templeLength: 145,
      lensHeight: 44,
      weight: "14g",
    },
    description:
      "Delicate round titanium frames with a rose gold finish. Inspired by intellectual elegance and artistic freedom.",
  },
  {
    id: "el-007",
    variantId: "ee200007-0000-0000-0000-000000000007",
    name: "Sport Flex Pro",
    brand: "Elite Lens",
    price: 179,
    image:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80",
    ],
    category: "sport",
    faceShape: ["oval", "square", "round"],
    material: "tr90",
    style: "rectangular",
    color: "Matte Navy",
    rating: 4.5,
    reviewCount: 203,
    specs: {
      lensWidth: 56,
      bridgeWidth: 16,
      templeLength: 130,
      lensHeight: 38,
      weight: "20g",
    },
    description:
      "Lightweight, impact-resistant sport frames with non-slip grip. Built for athletes who demand performance and style.",
  },
  {
    id: "el-008",
    variantId: "ee200008-0000-0000-0000-000000000008",
    name: "Milano Square",
    brand: "Elite Lens",
    price: 299,
    originalPrice: 359,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
    ],
    category: "sunglasses",
    faceShape: ["round", "oval"],
    material: "acetate",
    style: "rectangular",
    color: "Havana Brown",
    isNew: true,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 178,
    specs: {
      lensWidth: 55,
      bridgeWidth: 18,
      templeLength: 145,
      lensHeight: 42,
      weight: "30g",
    },
    description:
      "Bold rectangular acetate frames inspired by Italian craftsmanship. Rich Havana brown tones exude warmth and confidence.",
  },
  {
    id: "el-009",
    variantId: "ee200009-0000-0000-0000-000000000009",
    name: "Aero Lite",
    brand: "Elite Lens",
    price: 269,
    image:
      "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=800&q=80",
    ],
    category: "blue-light",
    faceShape: ["oval", "round", "heart"],
    material: "metal",
    style: "round",
    color: "Silver",
    rating: 4.6,
    reviewCount: 67,
    specs: {
      lensWidth: 50,
      bridgeWidth: 19,
      templeLength: 143,
      lensHeight: 46,
      weight: "16g",
    },
    description:
      "Featherweight metal rounds with advanced blue-light lenses. The perfect companion for long hours at the screen.",
  },
  {
    id: "el-010",
    variantId: "ee200010-0000-0000-0000-000000000010",
    name: "Shadow Stealth",
    brand: "Elite Lens",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    ],
    category: "sunglasses",
    faceShape: ["square", "oval"],
    material: "titanium",
    style: "aviator",
    color: "Matte Black",
    isBestseller: true,
    rating: 4.9,
    reviewCount: 245,
    specs: {
      lensWidth: 57,
      bridgeWidth: 15,
      templeLength: 140,
      lensHeight: 48,
      weight: "18g",
    },
    description:
      "Premium stealth-black titanium aviators with mirror-coated lenses. Engineered for those who lead, not follow.",
  },
];

export const categories = [
  {
    name: "Sunglasses",
    slug: "sunglasses",
    description: "UV protection meets iconic style",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
  },
  {
    name: "Optical",
    slug: "optical",
    description: "Precision clarity, refined design",
    image:
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&q=80",
  },
  {
    name: "Blue-Light",
    slug: "blue-light",
    description: "Shield your eyes from digital strain",
    image:
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80",
  },
  {
    name: "Sport",
    slug: "sport",
    description: "Performance eyewear for active lifestyles",
    image:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&q=80",
  },
];

export const faceShapes = [
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "oval", label: "Oval" },
  { value: "heart", label: "Heart" },
] as const;

export const materials = [
  { value: "titanium", label: "Titanium" },
  { value: "acetate", label: "Acetate" },
  { value: "metal", label: "Metal" },
  { value: "tr90", label: "TR-90" },
] as const;

export const styles = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "aviator", label: "Aviator" },
  { value: "cat-eye", label: "Cat-Eye" },
  { value: "round", label: "Round" },
  { value: "rectangular", label: "Rectangular" },
] as const;
