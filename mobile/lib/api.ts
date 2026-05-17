import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://10.242.49.212:3001/api/v1";

export type UserRole = "MAIN_ADMIN" | "MINOR_ADMIN" | "VET" | "CUSTOMER";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface TicketUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SupportTicket {
  id: string;
  ownerId: string;
  targetClinicId: string | null;
  assignedVetId: string | null;
  assignedAdminId: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  owner?: TicketUser;
  assignedVet?: TicketUser | null;
  assignedAdmin?: TicketUser | null;
  targetClinic?: { id: string; name: string } | null;
}

export interface Vet {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string | null;
}

export interface ScanResult {
  condition: string;
  confidence: number; // 0 – 100
  recommendation: string;
  affectedArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageDimensions: {
    width: number;
    height: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

class ApiClient {
  private async getHeaders(auth = true) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth) {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: any): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  }

  async registerCustomer(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/auth/register/customer`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async getMe(): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return response.json();
  }

  async logout() {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: await this.getHeaders(),
      });
    } catch (e) {
      console.warn("Logout request failed", e);
    }
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
  }

  // Pet Management
  async getPets(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/pets`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pets");
    }

    return response.json();
  }

  async addPet(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/pets`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add pet");
    }

    return response.json();
  }

  async getVetBook(petId: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/vetbook/${petId}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vet book");
    }

    return response.json();
  }

  // Clinic Operations
  async getClinics(): Promise<Clinic[]> {
    const response = await fetch(`${BASE_URL}/clinics`, {
      method: "GET",
      headers: await this.getHeaders(false), // Public endpoint
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clinics");
    }

    return response.json();
  }

  async getClinicDetails(clinicId: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/clinics/${clinicId}`, {
      method: "GET",
      headers: await this.getHeaders(false), // Public endpoint
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clinic details");
    }

    return response.json();
  }

  async getVetsFromAllClinics(): Promise<
    (Vet & { clinicId: string; clinicName: string })[]
  > {
    const clinics = await this.getClinics();
    const vetMap = new Map<
      string,
      Vet & { clinicId: string; clinicName: string }
    >();

    await Promise.all(
      clinics.map(async (clinic) => {
        try {
          const details = await this.getClinicDetails(clinic.id);
          const staffList: any[] = [];
          // include owner if vet role
          if (details.owner && details.owner.role === "VET") {
            staffList.push(details.owner);
          }
          // include staff members with vet role
          if (Array.isArray(details.staff)) {
            details.staff.forEach((s: any) => {
              if (s.user && s.user.role === "VET") {
                staffList.push(s.user);
              }
            });
          }
          staffList.forEach((u: any) => {
            if (!vetMap.has(u.id)) {
              vetMap.set(u.id, {
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: u.role,
                phone: u.phone,
                clinicId: clinic.id,
                clinicName: clinic.name,
              });
            }
          });
        } catch {
          // skip clinics that fail to load
        }
      }),
    );

    return Array.from(vetMap.values());
  }

  // Appointments
  async getMyAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${BASE_URL}/appointments/me`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    return response.json();
  }

  async getMyInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${BASE_URL}/invoices/me`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    return response.json();
  }

  async createAppointment(data: {
    clinicId: string;
    petId: string;
    date: string;
    reason?: string;
  }): Promise<Appointment> {
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to book appointment");
    }

    return response.json();
  }

  // AI Features
  async scanSkin(imageUri: string): Promise<ScanResult> {
    const token = await AsyncStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: "scan.jpg",
      type: "image/jpeg",
    } as any);

    // Do NOT set Content-Type – fetch will set it with the correct multipart boundary
    const response = await fetch(`${BASE_URL}/ai/scan-skin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Scan failed (${response.status})`);
    }

    return response.json();
  }

  // Veterinary Chat
  async vetChat(message: string): Promise<{ reply: string }> {
    const response = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Chat failed (${response.status})`);
    }

    return response.json();
  }

  // Support Tickets
  async getMyTickets(): Promise<SupportTicket[]> {
    const response = await fetch(`${BASE_URL}/support-tickets/me`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tickets");
    }

    return response.json();
  }

  async createTicket(data: {
    subject: string;
    description: string;
    assignedVetId: string;
    targetClinicId?: string;
  }): Promise<SupportTicket> {
    const response = await fetch(`${BASE_URL}/support-tickets`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create ticket");
    }

    return response.json();
  }

  // Prescriptions
  async getPetPrescriptions(petId: string): Promise<Prescription[]> {
    const response = await fetch(`${BASE_URL}/vetbook/${petId}/prescriptions`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch prescriptions");
    }

    return response.json();
  }

  // Get all clinics with staff (to extract vets)
  async getClinicStaff(clinicId: string): Promise<Vet[]> {
    const response = await fetch(`${BASE_URL}/clinics/${clinicId}/staff`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clinic staff");
    }

    return response.json();
  }
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface AppointmentClinic {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  operatingHours: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  ownerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentPet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
  microchip?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentVet {
  firstName: string;
  lastName: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  ownerId: string;
  vetId?: string | null;
  petId: string;
  date: string;
  status: AppointmentStatus;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
  clinic?: AppointmentClinic;
  pet?: AppointmentPet;
  vet?: AppointmentVet;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
}

export interface Prescription {
  id: string;
  petId: string;
  vetId: string;
  clinicId: string;
  medicalRecordId?: string | null;
  appointmentId?: string | null;
  medicineName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  notes?: string | null;
  issuedAt: string;
  updatedAt: string;
  clinic?: { id: string; name: string };
  vet?: { firstName: string; lastName: string };
  pet?: { name: string; species?: string };
}

export interface Invoice {
  id: string;
  clinicId: string;
  ownerId: string;
  appointmentId: string | null;
  amount: number;
  status: "PENDING" | "PAID";
  issuedAt: string;
  paidAt: string | null;
}

export const api = new ApiClient();
