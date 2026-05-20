import { SupportTicket, TicketStatus } from "@/lib/types";

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

export interface UpdateTicketPayload {
  status?: TicketStatus;
  assignedVetId?: string;
  assignedAdminId?: string;
}

class SupportTicketsService {
  async listAllTickets(): Promise<SupportTicket[]> {
    return apiFetch<SupportTicket[]>("/support-tickets");
  }

  async listAssignedTickets(): Promise<SupportTicket[]> {
    return apiFetch<SupportTicket[]>("/support-tickets/assigned");
  }

  async updateTicket(
    id: string,
    payload: UpdateTicketPayload,
  ): Promise<SupportTicket> {
    return apiFetch<SupportTicket>(`/support-tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async escalateTicket(id: string): Promise<SupportTicket> {
    return apiFetch<SupportTicket>(`/support-tickets/${id}/escalate`, {
      method: "PATCH",
    });
  }
}

export const supportTicketsService = new SupportTicketsService();
