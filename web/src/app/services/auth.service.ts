const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Request to ${path} failed.`);
  return json as T;
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Request to ${path} failed.`);
  return json as T;
}

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface RegisterDoctorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
}

export interface RegisterClinicRequest {
  ownerId: string;
  clinicName: string;
  clinicAddress: string;
  operatingHours?: string;
}

export interface RegisterDoctorResponse {
  id: string;
  name: string;
  email: string;
}

export interface RegisterClinicResponse {
  message: string;
  clinic: {
    id: string;
    status: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  isActive: boolean;
  /** Present only for VET role */
  clinicId?: string;
}

export interface ClinicStaffMember {
  id: string;
  clinicId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ClinicDetails {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  operatingHours: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  staff: ClinicStaffMember[];
}

// ─── Auth Service ──────────────────────────────────────────────────────────────

class AuthService {
  // ── Registration ────────────────────────────────────────────────────────────

  async registerDoctor(data: RegisterDoctorRequest): Promise<RegisterDoctorResponse> {
    return post<RegisterDoctorResponse>("/auth/register/doctor", data);
  }

  async registerClinic(data: RegisterClinicRequest): Promise<RegisterClinicResponse> {
    return post<RegisterClinicResponse>("/auth/register/clinic", data);
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  /** Login for Vet / Clinic Owner — POST /auth/login/clinic */
  async loginVet(data: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse>("/auth/login/clinic", data);
  }

  /** Login for Main Admin — POST /auth/login/admin */
  async loginAdmin(data: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse>("/auth/login/admin", data);
  }

  /** Login for Minor Admin — POST /auth/login (general) */
  async loginMinorAdmin(data: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse>("/auth/login", data);
  }

  // ── Profile ──────────────────────────────────────────────────────────────────

  /** GET /auth/me — returns profile including vetId for VET role */
  async getMyProfile(token: string): Promise<UserProfile> {
    return get<UserProfile>("/auth/me", token);
  }

  // ── Clinic ───────────────────────────────────────────────────────────────────

  /** GET /clinics/:id — public endpoint, no token required */
  async getClinicDetails(clinicId: string): Promise<ClinicDetails> {
    const res = await fetch(`${BASE_URL}/clinics/${clinicId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message ?? "Failed to fetch clinic details.");
    return json as ClinicDetails;
  }
}

export const authService = new AuthService();
