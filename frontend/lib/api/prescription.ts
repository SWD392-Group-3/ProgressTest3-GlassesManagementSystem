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
  status: string; // 'Pending', 'Confirmed', 'Rejected'

  cangKinh: string | null;
  banLe: string | null;
  vienGong: string | null;
  chanVeMui: string | null;
  cauGong: string | null;
  duoiGong: string | null;

  note: string | null;
  createdAt: string;
  updatedAt: string | null;
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
