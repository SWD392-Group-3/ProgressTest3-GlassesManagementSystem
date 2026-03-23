import { apiRequest, API } from "./client";

export interface CreateFeedbackRequest {
  productId: string;
  orderItemId: string;
  rating: number; // 1-5
  comment?: string | null;
}

export interface FeedbackResponse {
  id: string;
  customerName: string;
  productId: string;
  rating: number;
  comment?: string | null;
  status: string;
  createdAt: string;
}

export interface ProductFeedbackSummaryResponse {
  averageRating: number;
  totalFeedbacks: number;
  feedbacks: FeedbackResponse[];
}

/** POST /api/feedback - Thêm đánh giá */
export async function createFeedback(
  data: CreateFeedbackRequest,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    API.feedback.create,
    { method: "POST", body: JSON.stringify(data) },
    { auth: true },
  );
}

/** GET /api/feedback/product/{id} - Lấy ds đánh giá của sp */
export async function getProductFeedbacks(
  productId: string,
): Promise<ProductFeedbackSummaryResponse> {
  return apiRequest<ProductFeedbackSummaryResponse>(
    API.feedback.getProductFeedbacks(productId),
  );
}

/** GET /api/feedback/can-feedback?orderItemId=... - Check quyền đánh giá */
export async function checkCanFeedback(
  orderItemId: string,
): Promise<{ canFeedback: boolean }> {
  return apiRequest<{ canFeedback: boolean }>(
    API.feedback.checkCanFeedback(orderItemId),
    { method: "GET" },
    { auth: true },
  );
}

/** GET /api/feedback/all - Lấy tất cả đánh giá (Manager) */
export async function getAllFeedbacks(): Promise<FeedbackResponse[]> {
  return apiRequest<FeedbackResponse[]>(
    "/api/feedback/all",
    { method: "GET" },
    { auth: true },
  );
}

/** PUT /api/feedback/{id}/approve - Duyệt đánh giá (Manager) */
export async function approveFeedback(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/feedback/${id}/approve`,
    { method: "PUT" },
    { auth: true },
  );
}

/** PUT /api/feedback/{id}/reject - Từ chối đánh giá (Manager) */
export async function rejectFeedback(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/feedback/${id}/reject`,
    { method: "PUT" },
    { auth: true },
  );
}
