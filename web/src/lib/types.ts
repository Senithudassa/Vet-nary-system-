// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = "MAIN_ADMIN" | "MINOR_ADMIN" | "VET" | "CUSTOMER";
export type ClinicStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type InvoiceStatus = "PENDING" | "PAID";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

// ─── Models ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  accountNumber?: string;
  licenseCertificateUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  operatingHours?: string;
  status: ClinicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
  microchip?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: Pick<User, "firstName" | "lastName" | "email" | "phone">;
}

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
  clinic?: Pick<Clinic, "name">;
  owner?: Pick<User, "firstName" | "lastName">;
  vet?: Pick<User, "firstName" | "lastName">;
  pet?: Pick<Pet, "name" | "species">;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  vetId: string;
  clinicId: string;
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  recordDate: string;
  createdAt: string;
  vet?: Pick<User, "firstName" | "lastName">;
  clinic?: Pick<Clinic, "name">;
}

export interface Vaccination {
  id: string;
  petId: string;
  clinicId: string;
  administeredById: string;
  vaccineName: string;
  batchNumber: string;
  nextDueDate?: string;
  recordDate: string;
  createdAt: string;
  administeredBy?: Pick<User, "firstName" | "lastName">;
  clinic?: Pick<Clinic, "name">;
}

export interface Invoice {
  id: string;
  clinicId: string;
  ownerId: string;
  appointmentId?: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
  clinic?: Pick<Clinic, "name">;
  owner?: Pick<User, "firstName" | "lastName" | "email">;
}

export interface SupportTicket {
  id: string;
  ownerId: string;
  assignedVetId?: string | null;
  assignedAdminId?: string | null;
  targetClinicId?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  owner?: Partial<User>;
  assignedVet?: Partial<User>;
  assignedAdmin?: Partial<User>;
  targetClinic?: Pick<Clinic, "name">;
}
