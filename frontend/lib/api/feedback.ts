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
