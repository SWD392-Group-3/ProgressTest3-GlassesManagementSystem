import { apiRequest, API } from "./client";

export interface CreatePrescriptionRequest {
  serviceId: string;
  cangKinh: string;
  banLe: string;
  vienGong: string;
  chanVeMui: string;
  cauGong: string;
  duoiGong: string;
  note: string;
}

export interface UpdatePrescriptionRequest extends CreatePrescriptionRequest {}

export interface PrescriptionDto {
  id: string;
  customerId: string;
  serviceId: string;
  status: string; // 'PrescriptionPending', 'PrescriptionConfirmed', 'PrescriptionRejected'

  cangKinh: string | null;
  banLe: string | null;
  vienGong: string | null;
  chanVeMui: string | null;
  cauGong: string | null;
  duoiGong: string | null;

  note: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ConfirmPrescriptionRequest {
  productVariantId: string;
  lensesVariantId: string;
  shippingAddress: string;
  shippingPhone: string;
  note?: string;
}

export interface RejectPrescriptionRequest {
  reason?: string;
}

/**
 * POST /api/Prescription
 */
export async function createPrescription(
  data: CreatePrescriptionRequest,
): Promise<PrescriptionDto> {
  return apiRequest<PrescriptionDto>(
    API.prescription.create,
    { method: "POST", body: JSON.stringify(data) },
    { auth: true },
  );
}

/**
 * GET /api/Prescription
 */
export async function getMyPrescriptions(): Promise<PrescriptionDto[]> {
  return apiRequest<PrescriptionDto[]>(
    API.prescription.getByCustomer,
    { method: "GET" },
    { auth: true },
  );
}

/**
 * GET /api/Prescription/all  (Sales only)
 */
export async function getAllPrescriptions(): Promise<PrescriptionDto[]> {
  return apiRequest<PrescriptionDto[]>(
    API.prescription.getAll,
    { method: "GET" },
    { auth: true },
  );
}

/**
 * GET /api/Prescription/{id}
 */
export async function getPrescriptionById(
  id: string,
): Promise<PrescriptionDto> {
  return apiRequest<PrescriptionDto>(
    API.prescription.getById(id),
    { method: "GET" },
    { auth: true },
  );
}

/**
 * PUT /api/Prescription/{id}
 */
export async function updatePrescription(
  id: string,
  data: UpdatePrescriptionRequest,
): Promise<PrescriptionDto> {
  return apiRequest<PrescriptionDto>(
    API.prescription.update(id),
    { method: "PUT", body: JSON.stringify(data) },
    { auth: true },
  );
}

/**
 * PATCH /api/Prescription/{id}/confirm  (Sales only)
 */
export async function confirmPrescription(
  id: string,
  data: ConfirmPrescriptionRequest,
): Promise<PrescriptionDto> {
  return apiRequest<PrescriptionDto>(
    API.prescription.confirm(id),
    { method: "PATCH", body: JSON.stringify(data) },
    { auth: true },
  );
}

/**
 * PATCH /api/Prescription/{id}/reject  (Sales only)
 */
export async function rejectPrescription(
  id: string,
  data: RejectPrescriptionRequest,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    API.prescription.reject(id),
    { method: "PATCH", body: JSON.stringify(data) },
    { auth: true },
  );
}
