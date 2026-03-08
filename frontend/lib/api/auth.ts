import { apiRequest, API } from "./client";

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: string;
  customerId?: string | null; // Customer.Id — chỉ có khi role = "Customer"
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

/** POST /api/auth/login */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    return await apiRequest<LoginResponse>(API.auth.login, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed.";
    if (message === "Error 401" || message.includes("401"))
      throw new Error("Invalid email or password.");
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
