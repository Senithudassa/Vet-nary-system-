const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("vetnary_session");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? "";
  } catch {
    return "";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Request to ${path} failed.`);
  return json as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClinicStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ClinicListItem {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string | null;
  operatingHours?: string | null;
  status: ClinicStatus;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "MAIN_ADMIN" | "MINOR_ADMIN" | "VET" | "CUSTOMER";
  phone?: string | null;
  accountNumber?: string | null;
  licenseCertificateUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicStaffRecord {
  id: string;
  clinicId: string;
  userId: string;
  createdAt: string;
  user: UserSummary;
}

export interface ClinicDetails extends ClinicListItem {
  owner?: UserSummary | null;
  staff: ClinicStaffRecord[];
}

export interface UpdateClinicStatusRequest {
  status: ClinicStatus;
}

export interface UpdateClinicRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  operatingHours?: string;
}

// ─── Clinic Service ───────────────────────────────────────────────────────────

class ClinicService {
  /** GET /clinics/admin/all — list all clinics (Main Admin) */
  async getAllClinicsAdmin(): Promise<ClinicListItem[]> {
    return apiFetch<ClinicListItem[]>("/clinics/admin/all");
  }

  /** GET /clinics/:id — clinic details (Public) */
  async getClinicDetails(clinicId: string): Promise<ClinicDetails> {
    const res = await fetch(`${BASE_URL}/clinics/${clinicId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message ?? "Failed to fetch clinic.");
    return json as ClinicDetails;
  }

  /** PATCH /clinics/:id/status — update clinic status (Main Admin) */
  async updateClinicStatus(
    clinicId: string,
    status: ClinicStatus,
  ): Promise<ClinicListItem> {
    return apiFetch<ClinicListItem>(`/clinics/${clinicId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status } satisfies UpdateClinicStatusRequest),
    });
  }

  /** PATCH /clinics/:id — update clinic details (Vet or Main Admin) */
  async updateClinic(
    clinicId: string,
    data: UpdateClinicRequest,
  ): Promise<ClinicListItem> {
    return apiFetch<ClinicListItem>(`/clinics/${clinicId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const clinicService = new ClinicService();
