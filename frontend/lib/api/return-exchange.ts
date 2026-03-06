import { apiRequest, API } from "./client";

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
  orderItemId: string;
  quantity: number;
  reason: string | null;
  status: string;
  note: string | null;
  inspectionResult: string | null;
  createdAt: string;
  images: ReturnExchangeImageDto[];
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
  reason: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  reviewedBySalesAt: string | null;
  receivedByOperationAt: string | null;
  resolvedAt: string | null;
  items: ReturnExchangeItemDto[];
  histories: ReturnExchangeHistoryDto[];
}

/** POST /api/ReturnExchange/review — Staff phê duyệt/từ chối */
export interface ReviewReturnExchangeRequest {
  returnExchangeId: string;
  isApproved: boolean;
  comment?: string | null;
  rejectionReason?: string | null;
  images?: { returnExchangeItemId: string; imageUrls: string[]; description?: string | null }[] | null;
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

/** GET /api/ReturnExchange/pending — Staff xem yêu cầu chờ xử lý */
export async function getPendingReturnExchanges(): Promise<ReturnExchangeDto[]> {
  return apiRequest<ReturnExchangeDto[]>(API.returnExchange.pending, {}, { auth: true });
}

/** GET /api/ReturnExchange/approved — Operation xem yêu cầu đã phê duyệt */
export async function getApprovedReturnExchanges(): Promise<ReturnExchangeDto[]> {
  return apiRequest<ReturnExchangeDto[]>(API.returnExchange.approved, {}, { auth: true });
}

/** GET /api/ReturnExchange/{id} — Chi tiết một yêu cầu đổi trả */
export async function getReturnExchangeById(id: string): Promise<ReturnExchangeDto> {
  return apiRequest<ReturnExchangeDto>(API.returnExchange.getById(id), {}, { auth: true });
}

/** POST /api/ReturnExchange/review — Staff phê duyệt hoặc từ chối */
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
