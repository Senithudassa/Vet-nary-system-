const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getToken(): string {
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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
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

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  clinicId: string;
  ownerId: string;
  vetId?: string;
  petId: string;
  date: string;
  status: AppointmentStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  clinic?: { name: string };
  owner?: { firstName: string; lastName: string };
  vet?: { firstName: string; lastName: string };
  pet?: { name: string; species: string };
}

export interface BookAppointmentRequest {
  clinicId: string;
  petId: string;
  date: string;
  reason?: string;
}

export interface QueueEntry {
  id: string;
  clinicId: string;
  petId: string;
  appointmentId?: string;
  position?: number;
  createdAt: string;
  pet?: { name: string; species: string };
  appointment?: Pick<Appointment, "id" | "date" | "reason" | "status">;
  owner?: { firstName: string; lastName: string };
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  operatingHours?: string;
  phone?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  isActive: boolean;
  ownerId: string;
  owner?: { firstName: string; lastName: string; email?: string };
}

// ─── Appointment Service ───────────────────────────────────────────────────────

class AppointmentService {
  // ── Appointments ─────────────────────────────────────────────────────────────

  /** POST /appointments — Book a new appointment (Customer) */
  async bookAppointment(data: BookAppointmentRequest): Promise<Appointment> {
    return apiFetch<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /** GET /appointments/me — List my appointments (Customer) */
  async getMyAppointments(): Promise<Appointment[]> {
    return apiFetch<Appointment[]>("/appointments/me");
  }

  /** GET /clinics/:clinicId/appointments — List clinic appointments (Vet) */
  async getClinicAppointments(clinicId: string): Promise<Appointment[]> {
    return apiFetch<Appointment[]>(`/clinics/${clinicId}/appointments`);
  }

  /** PATCH /appointments/:id/status — Update appointment status */
  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment> {
    return apiFetch<Appointment>(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ── Queue ─────────────────────────────────────────────────────────────────────

  /** GET /clinics/:clinicId/queue — Get clinic queue (Vet) */
  async getQueue(clinicId: string): Promise<QueueEntry[]> {
    return apiFetch<QueueEntry[]>(`/clinics/${clinicId}/queue`);
  }

  /** POST /clinics/:clinicId/queue — Add to queue (Vet) */
  async addToQueue(
    clinicId: string,
    petId: string,
    appointmentId?: string
  ): Promise<QueueEntry> {
    return apiFetch<QueueEntry>(`/clinics/${clinicId}/queue`, {
      method: "POST",
      body: JSON.stringify({ petId, ...(appointmentId ? { appointmentId } : {}) }),
    });
  }

  // ── Supporting Data ───────────────────────────────────────────────────────────

  /** GET /clinics — List approved clinics (Public) */
  async getClinics(): Promise<Clinic[]> {
    const res = await fetch(`${BASE_URL}/clinics`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message ?? "Failed to fetch clinics.");
    return Array.isArray(json) ? json : json.data ?? [];
  }

  /** GET /pets — List my pets (Customer) */
  async getMyPets(): Promise<Pet[]> {
    return apiFetch<Pet[]>("/pets");
  }

  /** GET /auth/me — Get current user profile */
  async getMyProfile(): Promise<{
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    clinicId?: string;
    vetId?: string;
  }> {
    return apiFetch("/auth/me");
  }
}

export const appointmentService = new AppointmentService();
