const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export interface AdminStats {
  totalUsers: number;
  totalActiveClients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalRegisteredPets: number;
  totalOpenTickets: number;
  pendingInvoices: number;
  pendingVets: number;
  appointmentsByStatus: {
    COMPLETED?: number;
    CONFIRMED?: number;
    PENDING?: number;
    CANCELLED?: number;
    [key: string]: number | undefined;
  };
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    return apiFetch<AdminStats>("/admin/stats");
  }
}

export const adminService = new AdminService();
