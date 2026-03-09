import { getToken } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface EyeResultDto {
  id: string;
  orderId: string;
  staffId: string;
  staffName: string | null;
  eyeLeft: string | null;
  eyeRight: string | null;
  vien: boolean;
  loan: boolean;
  can: number | null;
  note: string | null;
}

export interface CreateEyeResultRequest {
  orderId: string;
  eyeLeft?: string;
  eyeRight?: string;
  vien?: boolean;
  loan?: boolean;
  can?: number | null;
  note?: string;
}

export interface UpdateEyeResultRequest {
  eyeLeft?: string;
  eyeRight?: string;
  vien?: boolean;
  loan?: boolean;
  can?: number | null;
  note?: string;
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res;
}

export async function getEyeResultsByOrder(
  orderId: string,
): Promise<EyeResultDto[]> {
  const res = await authFetch(`${API_BASE}/api/eye-result/order/${orderId}`);
  return res.json();
}

export async function createEyeResult(
  data: CreateEyeResultRequest,
): Promise<EyeResultDto> {
  const res = await authFetch(`${API_BASE}/api/eye-result`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEyeResult(
  id: string,
  data: UpdateEyeResultRequest,
): Promise<EyeResultDto> {
  const res = await authFetch(`${API_BASE}/api/eye-result/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteEyeResult(id: string): Promise<void> {
  await authFetch(`${API_BASE}/api/eye-result/${id}`, { method: "DELETE" });
}
