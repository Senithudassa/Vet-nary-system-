import type { Clinic, SupportTicket } from "@/lib/types";

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(
  Date.now() - 3 * 24 * 60 * 60 * 1000,
).toISOString();

export const mockClinics: Clinic[] = [
  {
    id: "CL-01",
    name: "Paws & Care Veterinary",
    address: "123 Main St, Springfield",
    phone: "(555) 010-1000",
    operatingHours: "Mon-Fri 9am-6pm",
    status: "APPROVED",
    createdAt: threeDaysAgo,
    updatedAt: yesterday,
  },
  {
    id: "CL-02",
    name: "Healthy Tails Animal Clinic",
    address: "45 Maple Ave, Riverton",
    phone: "(555) 010-2000",
    operatingHours: "Mon-Sat 8am-5pm",
    status: "APPROVED",
    createdAt: twoDaysAgo,
    updatedAt: now,
  },
  {
    id: "CL-03",
    name: "Northside Vet Center",
    address: "789 Oak Blvd, Lakeside",
    phone: "(555) 010-3000",
    operatingHours: "Mon-Fri 10am-7pm",
    status: "PENDING",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: "TKT-1001",
    ownerId: "USR-100",
    targetClinicId: "CL-01",
    subject: "Appointment reschedule request",
    description:
      "Customer wants to reschedule the appointment to next Thursday afternoon.",
    status: "OPEN",
    createdAt: twoDaysAgo,
    updatedAt: yesterday,
    owner: {
      firstName: "Ava",
      lastName: "Cole",
      email: "ava.cole@example.com",
      phone: "(555) 010-4010",
    },
    targetClinic: {
      name: "Paws & Care Veterinary",
    },
  },
  {
    id: "TKT-1002",
    ownerId: "USR-101",
    targetClinicId: "CL-02",
    subject: "Invoice discrepancy",
    description:
      "Customer reports invoice total doesn't match quoted estimate.",
    status: "IN_PROGRESS",
    createdAt: threeDaysAgo,
    updatedAt: now,
    owner: {
      firstName: "Liam",
      lastName: "Nguyen",
      email: "liam.nguyen@example.com",
      phone: "(555) 010-4020",
    },
    assignedAdminId: "ADM-01",
    assignedAdmin: {
      firstName: "Sarah",
      lastName: "Kim",
    },
    targetClinic: {
      name: "Healthy Tails Animal Clinic",
    },
  },
  {
    id: "TKT-1003",
    ownerId: "USR-102",
    targetClinicId: "CL-01",
    subject: "Medical records access",
    description:
      "Owner requests a copy of the pet's vaccination records for travel.",
    status: "RESOLVED",
    createdAt: threeDaysAgo,
    updatedAt: yesterday,
    owner: {
      firstName: "Noah",
      lastName: "Patel",
      email: "noah.patel@example.com",
    },
    assignedVetId: "VET-200",
    assignedVet: {
      firstName: "Priya",
      lastName: "Shah",
    },
    targetClinic: {
      name: "Paws & Care Veterinary",
    },
  },
];
