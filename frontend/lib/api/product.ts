import { apiRequest } from "./client";
import type { Product } from "@/constants/products";

// ─── DTOs (match backend BusinessLogicLayer.DTOs.Manager) ─────────────────────

export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
}

export interface BrandDto {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  status: string | null;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  color: string | null;
  size: string | null;
  material: string | null;
  price: number;
  status: string | null;
  imageUrl: string | null;
}

export interface LensesVariantDto {
  id: string;
  productId: string;
  doCau: number | null;
  doTru: number | null;
  chiSoKhucXa: number | null;
  price: number;
  status: string | null;
  imageUrl: string | null;
}

export interface ProductDto {
  id: string;
  categoryId: string | null;
  brandId: string | null;
  warrantyPolicyId: string | null;
  name: string;
  description: string | null;
  unitPrice: number;
  status: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category: CategoryDto | null;
  brand: BrandDto | null;
  productVariants: ProductVariantDto[];
  lensesVariants: LensesVariantDto[];
}

// ─── Mapper: ProductDto → Product (frontend interface) ────────────────────────

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80";

function normalizeCategoryName(name?: string | null): Product["category"] {
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("sun")) return "sunglasses";
  if (lower.includes("blue")) return "blue-light";
  if (lower.includes("sport")) return "sport";
  return "optical";
}

export function mapProductDtoToProduct(dto: ProductDto): Product {
  const variant = dto.productVariants?.[0];
  const image = dto.imageUrl ?? variant?.imageUrl ?? FALLBACK_IMAGE;
  return {
    id: dto.id,
    variantId: variant?.id ?? dto.id,
    name: dto.name,
    brand: dto.brand?.name ?? "Unknown",
    price: variant?.price ?? dto.unitPrice ?? 0,
    image,
    images: [image],
    category: normalizeCategoryName(dto.category?.name),
    faceShape: ["oval"],
    material:
      (variant?.material?.toLowerCase() as Product["material"]) ?? "acetate",
    style: "modern",
    color: variant?.color ?? "",
    rating: 0,
    reviewCount: 0,
    description: dto.description ?? "",
    specs: {
      lensWidth: 0,
      bridgeWidth: 0,
      templeLength: 0,
      lensHeight: 0,
      weight: "N/A",
    },
  };
}

// ─── API functions ─────────────────────────────────────────────────────────────

/** GET /api/products */
export async function getProducts(): Promise<ProductDto[]> {
  return apiRequest<ProductDto[]>("/api/products");
}

/** GET /api/products/:id */
export async function getProduct(id: string): Promise<ProductDto> {
  return apiRequest<ProductDto>(`/api/products/${id}`);
}

/** @deprecated use getProduct instead */
export async function getProductById(id: string): Promise<ProductDto | null> {
  try {
    return await getProduct(id);
  } catch {
    return null;
  }
}

/** GET /api/products/categories */
export async function getCategories(): Promise<CategoryDto[]> {
  return apiRequest<CategoryDto[]>("/api/products/categories");
}

/** GET /api/products/brands */
export async function getBrands(): Promise<BrandDto[]> {
  return apiRequest<BrandDto[]>("/api/products/brands");
}

/** GET /api/products/frame-variants?productId=:productId */
export async function getFrameVariants(
  productId: string,
): Promise<ProductVariantDto[]> {
  return apiRequest<ProductVariantDto[]>(
    `/api/products/frame-variants?productId=${productId}`,
  );
}

/** GET /api/products/frame-variants/:id */
export async function getFrameVariant(id: string): Promise<ProductVariantDto> {
  return apiRequest<ProductVariantDto>(`/api/products/frame-variants/${id}`);
}

/** GET /api/products/lens-variants?productId=:productId */
export async function getLensVariants(
  productId: string,
): Promise<LensesVariantDto[]> {
  return apiRequest<LensesVariantDto[]>(
    `/api/products/lens-variants?productId=${productId}`,
  );
}

/** GET /api/products/lens-variants/:id */
export async function getLensVariant(id: string): Promise<LensesVariantDto> {
  return apiRequest<LensesVariantDto>(`/api/products/lens-variants/${id}`);
}
