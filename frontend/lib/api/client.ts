import { getToken } from "../auth-storage";

/**
 * Base URL của backend API (từ env).
 */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return "http://localhost:5000";
  return url.replace(/\/$/, "");
}

/** Mapping API endpoints (backend routes). Thêm domain/endpoint mới tại đây. */
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
    getOrders: "/api/Order/orders",
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
