import { apiRequest, API } from "./client";

export interface MomoCreatePaymentResponse {
  payUrl: string;
  orderId: string;
  requestId: string;
  amount: number;
  message: string;
  resultCode: number;
}

/** POST /api/payment/momo */
export async function createMomoPayment(
  orderId: string,
  amount: number,
  orderInfo?: string,
): Promise<MomoCreatePaymentResponse> {
  return apiRequest<MomoCreatePaymentResponse>(
    API.payment.momoCreate,
    { method: "POST", body: JSON.stringify({ orderId, amount, orderInfo }) },
    { auth: true },
  );
}
