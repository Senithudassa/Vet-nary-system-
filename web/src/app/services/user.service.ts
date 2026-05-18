import { User, Role } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

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

export interface UserFilterDto {
  search?: string;
  role?: Role | "ALL";
  page?: number;
  limit?: number;
}

class UserService {
  async getUsers(params?: UserFilterDto): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.role && params.role !== "ALL")
      searchParams.append("role", params.role);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const qs = searchParams.toString();
    const url = `/users${qs ? `?${qs}` : ""}`;

    const response = await apiFetch<any>(url);
    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  async getUserById(id: string): Promise<User> {
    return apiFetch<User>(`/users/${id}`);
  }

  async updateUserRole(id: string, role: Role): Promise<User> {
    return apiFetch<User>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }
}

export const userService = new UserService();
