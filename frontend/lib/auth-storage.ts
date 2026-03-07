const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface StoredUser {
  userId: string;
  customerId?: string | null; // Customer.Id — chỉ có khi role = "Customer"
  email: string;
  fullName: string | null;
  role: string | null;
  expiresAt: string;
}

export function saveAuth(token: string, user: StoredUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
