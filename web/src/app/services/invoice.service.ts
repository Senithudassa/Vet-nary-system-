import { apiFetch } from "./appointment.service";

export interface Invoice {
  id: string;
  clinicId: string;
  ownerId: string;
  appointmentId?: string;
  amount: number;
  status: "PENDING" | "PAID";
  issuedAt: string;
  paidAt?: string;
}

export interface CreateInvoiceRequest {
  clinicId: string;
  ownerId: string;
  appointmentId?: string;
  amount: number;
}

class InvoiceService {
  async createInvoice(data: CreateInvoiceRequest) {
    return apiFetch<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getClinicInvoices(clinicId: string) {
    return apiFetch<Invoice[]>(`/clinics/${clinicId}/invoices`);
  }

  async getMyInvoices() {
    return apiFetch<Invoice[]>("/invoices/me");
  }

  async payInvoice(id: string) {
    return apiFetch<Invoice>(`/invoices/${id}/pay`, {
      method: "PATCH",
    });
  }
}

export const invoiceService = new InvoiceService();
