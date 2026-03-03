import { getToken } from "./auth-storage";

/**
 * Base URL của backend API (từ env).
 */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return "http://localhost:5000";
  return url.replace(/\/$/, "");
}

// ─── Mapping API endpoints (backend routes) ─────────────────────────────────
export const API = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  cart: {
    get: (customerId: string) => `/api/cart/${customerId}`,
    create: (customerId: string) => `/api/cart/${customerId}/create`,
    addItem: (customerId: string) => `/api/cart/${customerId}/items`,
    updateItem: (cartItemId: string) => `/api/cart/items/${cartItemId}`,
    removeItem: (cartItemId: string) => `/api/cart/items/${cartItemId}`,
  },
  order: {
    getById: (orderId: string) => `/api/order/${orderId}`,
    getByCustomer: "/api/order/customer",
    fromCart: "/api/order/from-cart",
    manual: "/api/order/manual",
    updateStatus: (orderId: string) => `/api/order/${orderId}/status`,
    cancel: (orderId: string) => `/api/order/${orderId}/cancel`,
  },
  payment: {
    momoCreate: "/api/payment/momo",
  },
} as const;

export type ApiEndpoint = string;

/**
 * Gọi API backend. Tự gắn base URL, Content-Type JSON, và (nếu auth: true) Bearer token.
 */
export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = {},
): Promise<T> {
  const base = getApiUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  if (options.auth) {
    const token = getToken();
    if (token)
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ?? `Lỗi ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string | null;
  phone?: string | null;
}

// ─── Cart Types ──────────────────────────────────────────────────────────────

export interface CartItemDto {
  cartItemId: string;
  productVariantId: string | null;
  lensesVariantId: string | null;
  comboItemId: string | null;
  serviceId: string | null;
  slotId: string | null;
  quantity: number;
  unitPrice: number;
  note: string | null;
}

export interface CartDto {
  cartId: string;
  customerId: string;
  items: CartItemDto[];
  totalAmount: number;
}

export interface AddCartItemRequest {
  productVariantId?: string | null;
  lensesVariantId?: string | null;
  comboItemId?: string | null;
  serviceId?: string | null;
  slotId?: string | null;
  quantity: number;
  note?: string | null;
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export interface OrderItemDto {
  orderItemId: string;
  productVariantId: string | null;
  lensesVariantId: string | null;
  comboItemId: string | null;
  serviceId: string | null;
  slotId: string | null;
  quantity: number;
  unitPrice: number;
  note: string | null;
}

export interface OrderDto {
  orderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: string;
  shippingPhone: string;
  note: string | null;
  orderDate: string;
  items: OrderItemDto[];
}

export interface CreateOrderRequest {
  cartId: string;
  promotionId?: string | null;
  shippingAddress: string;
  shippingPhone: string;
  note?: string | null;
}

// ─── Payment Types ────────────────────────────────────────────────────────────

export interface MomoCreatePaymentResponse {
  payUrl: string;
  orderId: string;
  requestId: string;
  amount: number;
  message: string;
  resultCode: number;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

/** POST /api/auth/login */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    return await apiRequest<LoginResponse>(API.auth.login, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đăng nhập thất bại.";
    if (message === "Lỗi 401")
      throw new Error("Email hoặc mật khẩu không đúng.");
    throw err;
  }
}

/** POST /api/auth/register */
export async function register(body: RegisterRequest): Promise<LoginResponse> {
  const payload = {
    email: (body.email ?? "").trim(),
    password: body.password,
    fullName: body.fullName?.trim() || null,
    phone: body.phone?.trim() || null,
  };
  return apiRequest<LoginResponse>(API.auth.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Cart API ────────────────────────────────────────────────────────────────

/** GET /api/cart/{customerId} */
export async function getCart(customerId: string): Promise<CartDto> {
  return apiRequest<CartDto>(API.cart.get(customerId), {}, { auth: true });
}

/** POST /api/cart/{customerId}/create */
export async function createCart(customerId: string): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.create(customerId),
    { method: "POST" },
    { auth: true },
  );
}

/** POST /api/cart/{customerId}/items */
export async function addCartItem(
  customerId: string,
  body: AddCartItemRequest,
): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.addItem(customerId),
    { method: "POST", body: JSON.stringify(body) },
    { auth: true },
  );
}

/** PUT /api/cart/items/{cartItemId} */
export async function updateCartItem(
  cartItemId: string,
  quantity: number,
): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.updateItem(cartItemId),
    { method: "PUT", body: JSON.stringify({ quantity }) },
    { auth: true },
  );
}

/** DELETE /api/cart/items/{cartItemId} */
export async function removeCartItem(cartItemId: string): Promise<void> {
  await apiRequest<void>(
    API.cart.removeItem(cartItemId),
    { method: "DELETE" },
    { auth: true },
  );
}

// ─── Order API ────────────────────────────────────────────────────────────────

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

// ─── Payment API ──────────────────────────────────────────────────────────────

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
