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
  // Thêm endpoint khác khi có, ví dụ:
  // products: "/api/products",
  // user: "/api/user/profile",
} as const;

export type ApiEndpoint = (typeof API)["auth"][keyof (typeof API)["auth"]];

/**
 * Gọi API backend. Tự gắn base URL, Content-Type JSON, và (nếu auth: true) Bearer token.
 * @param path - Đường dẫn API (dùng từ API.auth.login, API.auth.register, ...)
 * @param init - Fetch options (method, body, headers bổ sung, ...)
 * @param options.auth - true thì gắn header Authorization: Bearer <token>
 */
export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = {}
): Promise<T> {
  const base = getApiUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  if (options.auth) {
    const token = getToken();
    if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? `Lỗi ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Types (khớp backend DTOs) ──────────────────────────────────────────────

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

// ─── Auth API (mapping với backend AuthController) ────────────────────────────

/** POST /api/auth/login */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    return await apiRequest<LoginResponse>(API.auth.login, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Đăng nhập thất bại.";
    if (message === "Lỗi 401") throw new Error("Email hoặc mật khẩu không đúng.");
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
