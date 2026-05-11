import { apiFetch } from "./appointment.service";

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
}

export interface CreateMedicalRecordRequest {
  clinicId: string;
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
}

export interface CreateVaccinationRequest {
  clinicId: string;
  vaccineName: string;
  batchNumber: string;
  nextDueDate?: string;
}

export interface CreatePrescriptionRequest {
  clinicId: string;
  medicalRecordId?: string;
  appointmentId?: string;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

class VetbookService {
  async getPetTimeline(petId: string) {
    return apiFetch<any[]>(`/vetbook/${petId}`);
  }

  async addMedicalRecord(petId: string, data: CreateMedicalRecordRequest) {
    return apiFetch<MedicalRecord>(`/vetbook/${petId}/medical`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async addVaccination(petId: string, data: CreateVaccinationRequest) {
    return apiFetch<Vaccination>(`/vetbook/${petId}/vaccine`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async addPrescription(petId: string, data: CreatePrescriptionRequest) {
    return apiFetch<Prescription>(`/vetbook/${petId}/prescription`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const vetbookService = new VetbookService();
