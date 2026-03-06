import { apiRequest, API, getApiUrl } from "./client";
import { getToken } from "../auth-storage";

export interface ReturnExchangeItemDto {
  id: string;
  returnExchangeId?: string;
  orderItemId: string;
  isReturned: boolean;
  isExchanged: boolean;
  quantity: number;
  reason: string;
  images: string[];
}

export interface ReturnExchangeDto {
  id: string;
  orderId: string;
  customerId: string;
  type: string; // 'Return' or 'Exchange'
  status: string; // 'Pending', 'ApprovedBySales', 'ReceivedByOperation', 'Rejected', 'Completed'
  totalRefundAmount: number | null;
  reason: string;
  images: string[];
  createdAt: string;
  resolvedAt: string | null;
  items: ReturnExchangeItemDto[];
}

export interface CreateReturnExchangeItemRequest {
  orderItemId: string;
  isReturned: boolean;
  isExchanged: boolean;
  quantity: number;
  reason: string;
  images: string[];
}

export interface CreateReturnExchangeRequest {
  orderId: string;
  type: string;
  reason: string;
  items: CreateReturnExchangeItemRequest[];
}

/**
 * POST /api/ReturnExchange
 */
export async function createReturnExchange(
  data: CreateReturnExchangeRequest,
): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(
    API.returnExchange.create,
    { method: "POST", body: JSON.stringify(data) },
    { auth: true },
  );
}

/**
 * GET /api/ReturnExchange/customer
 */
export async function getMyReturnExchanges(): Promise<ReturnExchangeDto[]> {
  return apiRequest<ReturnExchangeDto[]>(
    API.returnExchange.getByCustomer,
    { method: "GET" },
    { auth: true },
  );
}

/**
 * GET /api/ReturnExchange/{id}
 */
export async function getReturnExchangeById(
  id: string,
): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(
    API.returnExchange.getById(id),
    { method: "GET" },
    { auth: true },
  );
}

/**
 * POST /api/ReturnExchange/{id}/images
 */
export async function addImagesToReturnExchange(
  id: string,
  imageUrls: string[],
): Promise<void> {
  await apiRequest<void>(
    API.returnExchange.addImages(id),
    { method: "POST", body: JSON.stringify(imageUrls) },
    { auth: true },
  );
}

/**
 * POST /api/ReturnExchange/upload-images (Multipart Form Data)
 */
export async function uploadReturnImages(
  formData: FormData,
): Promise<string[]> {
  const base = getApiUrl();
  const url = `${base}${API.returnExchange.uploadImages}`;

  const headers: HeadersInit = {};
  const token = getToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Not passing Content-Type here, browser sets it to multipart/form-data with the correct boundary
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi upload ảnh (${res.status})`);
  }

  return await res.json();
}
