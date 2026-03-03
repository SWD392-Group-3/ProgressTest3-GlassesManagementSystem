import { apiRequest, API } from "./client";

export interface OrderItemDto {
  id: string;
  orderId: string;
  productVariantId: string | null;
  lensesVariantId: string | null;
  comboItemId: string | null;
  serviceId: string | null;
  slotId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note: string | null;
}

export interface OrderDto {
  id: string;
  customerId: string;
  promotionId?: string | null;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount?: number;
  shippingAddress: string;
  shippingPhone: string;
  note: string | null;
  orderDate: string;
  orderItems: OrderItemDto[];
}

export interface CreateOrderRequest {
  cartId: string;
  promotionId?: string | null;
  shippingAddress: string;
  shippingPhone: string;
  note?: string | null;
}

/**
 * GET /api/Order/orders — Staff/Operation lấy tất cả đơn hàng
 */
export async function getOrders(): Promise<OrderDto[]> {
  return apiRequest<OrderDto[]>(API.order.getOrders, {}, { auth: true });
}

/** GET /api/order/{orderId} */
export async function getOrderById(orderId: string): Promise<OrderDto> {
  return apiRequest<OrderDto>(API.order.getById(orderId), {}, { auth: true });
}

/** GET /api/order/customer */
export async function getMyOrders(): Promise<OrderDto[]> {
  return apiRequest<OrderDto[]>(API.order.getByCustomer, {}, { auth: true });
}

/** POST /api/order/from-cart */
export async function createOrderFromCart(
  body: CreateOrderRequest,
): Promise<OrderDto> {
  return apiRequest<OrderDto>(
    API.order.fromCart,
    { method: "POST", body: JSON.stringify(body) },
    { auth: true },
  );
}

/** PATCH /api/order/{orderId}/cancel */
export async function cancelOrder(orderId: string): Promise<void> {
  await apiRequest<void>(
    API.order.cancel(orderId),
    { method: "PATCH" },
    { auth: true },
  );
}

/** PATCH /api/order/{orderId}/status — Staff/Admin cập nhật trạng thái đơn hàng */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<void> {
  await apiRequest<void>(
    API.order.updateStatus(orderId),
    { method: "PATCH", body: JSON.stringify({ status }) },
    { auth: true },
  );
}
