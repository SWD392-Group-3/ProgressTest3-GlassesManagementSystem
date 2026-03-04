import { apiRequest } from "./client";

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

// ─── API functions ─────────────────────────────────────────────────────────────

/** GET /api/products */
export async function getProducts(): Promise<ProductDto[]> {
  return apiRequest<ProductDto[]>("/api/products");
}

/** GET /api/products/:id */
export async function getProduct(id: string): Promise<ProductDto> {
  return apiRequest<ProductDto>(`/api/products/${id}`);
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
