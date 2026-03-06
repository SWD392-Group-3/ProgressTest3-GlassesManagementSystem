import { apiRequest, API, getApiUrl } from "./client";
import { getToken } from "../auth-storage";

/** DTO khớp backend ReturnExchangeResponse */
export interface ReturnExchangeImageDto {
  id: string;
  imageUrl: string;
  uploadedByRole: string;
  uploadedByUserId: string;
  uploadedAt: string;
  description: string | null;
}

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

export interface ReturnExchangeHistoryDto {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  comment: string | null;
  performedByUserId: string;
  performedByRole: string;
  performedAt: string;
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

/** POST /api/ReturnExchange/review — Sales phê duyệt/từ chối */
export interface ReviewReturnExchangeRequest {
  returnExchangeId: string;
  isApproved: boolean;
  comment?: string | null;
  rejectionReason?: string | null;
  images?:
    | {
        returnExchangeItemId: string;
        imageUrls: string[];
        description?: string | null;
      }[]
    | null;
}

/** POST /api/ReturnExchange/receive — Operation nhận hàng */
export interface ReceiveItemRequest {
  returnExchangeItemId: string;
  status: string; // Received, Rejected
  note?: string | null;
  inspectionResult?: string | null; // Available, Defective, Damaged, NeedRepair
  imageUrls?: string[] | null;
}

export interface ReceiveReturnExchangeRequest {
  returnExchangeId: string;
  comment?: string | null;
  items: ReceiveItemRequest[];
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

/** POST /api/ReturnExchange — Customer tạo yêu cầu đổi / trả */
export async function createReturnExchange(
  data: CreateReturnExchangeRequest,
): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(API.returnExchange.create, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** GET /api/ReturnExchange/customer — danh sách yêu cầu của chính khách hàng */
export async function getMyReturnExchanges(): Promise<ReturnExchangeDto[]> {
  return apiRequest<ReturnExchangeDto[]>(API.returnExchange.getByCustomer, {
    method: "GET",
  });
}

/** POST /api/ReturnExchange/upload-images (Multipart Form Data) */
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

  // Không set Content-Type để browser tự thêm boundary
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

/** GET /api/ReturnExchange/pending — Sales xem yêu cầu chờ xử lý */
export async function getPendingReturnExchanges(): Promise<
  ReturnExchangeDto[]
> {
  return apiRequest<ReturnExchangeDto[]>(
    API.returnExchange.getPending,
    {},
    { auth: true },
  );
}

/** GET /api/ReturnExchange/approved — Operation xem yêu cầu đã phê duyệt */
export async function getApprovedReturnExchanges(): Promise<
  ReturnExchangeDto[]
> {
  return apiRequest<ReturnExchangeDto[]>(
    API.returnExchange.getApproved,
    {},
    { auth: true },
  );
}

/** GET /api/ReturnExchange/{id} — Chi tiết một yêu cầu đổi trả */
export async function getReturnExchangeById(
  id: string,
): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(
    API.returnExchange.getById(id),
    {},
    { auth: true },
  );
}

/** POST /api/ReturnExchange/review — Sales phê duyệt hoặc từ chối */
export async function reviewReturnExchange(
  body: ReviewReturnExchangeRequest,
): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(
    API.returnExchange.review,
    { method: "POST", body: JSON.stringify(body) },
    { auth: true },
  );
}

/** POST /api/ReturnExchange/receive — Operation nhận hàng và cập nhật từng item */
export async function receiveReturnExchange(
  body: ReceiveReturnExchangeRequest,
): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(
    API.returnExchange.receive,
    { method: "POST", body: JSON.stringify(body) },
    { auth: true },
  );
}
