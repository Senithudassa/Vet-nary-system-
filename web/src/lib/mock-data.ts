import type {
    User, Clinic, Pet, Appointment, MedicalRecord,
    Vaccination, Invoice, SupportTicket,
} from "./types";

// ─── Helper ───────────────────────────────────────────────────────────────────

const iso = (daysAgo = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
};

const futureIso = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString();
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
    { id: "u-001", email: "main_admin@vetnary.io", role: "MAIN_ADMIN", firstName: "Ranil", lastName: "Perera", phone: "0771234567", accountNumber: "VN-0001", isActive: true, createdAt: iso(120), updatedAt: iso(1) },
    { id: "u-002", email: "minor_admin@vetnary.io", role: "MINOR_ADMIN", firstName: "Sarah", lastName: "Fernando", phone: "0779876543", accountNumber: "VN-0002", isActive: true, createdAt: iso(100), updatedAt: iso(2) },
    { id: "u-003", email: "vet@riveredge.lk", role: "VET", firstName: "Nimal", lastName: "Silva", phone: "0712345678", accountNumber: "VN-0003", isActive: true, createdAt: iso(90), updatedAt: iso(5) },
    { id: "u-004", email: "vet@petcare.lk", role: "VET", firstName: "Kamani", lastName: "Jayawardena", phone: "0723456789", accountNumber: "VN-0004", isActive: true, createdAt: iso(85), updatedAt: iso(3) },
    { id: "u-005", email: "senith@gmail.com", role: "CUSTOMER", firstName: "Senith", lastName: "Udayakumara", phone: "0761234567", accountNumber: "VN-8429", isActive: true, createdAt: iso(60), updatedAt: iso(10) },
    { id: "u-006", email: "kasun@gmail.com", role: "CUSTOMER", firstName: "Kasun", lastName: "Pathirana", phone: "0752345678", accountNumber: "VN-3310", isActive: true, createdAt: iso(55), updatedAt: iso(8) },
    { id: "u-007", email: "nadeeka@gmail.com", role: "CUSTOMER", firstName: "Nadeeka", lastName: "Senevirathne", phone: "0743456789", accountNumber: "VN-1102", isActive: true, createdAt: iso(50), updatedAt: iso(12) },
    { id: "u-008", email: "nuwan@gmail.com", role: "CUSTOMER", firstName: "Nuwan", lastName: "Jayasekara", phone: "0734567890", accountNumber: "VN-5501", isActive: true, createdAt: iso(45), updatedAt: iso(6) },
    { id: "u-009", email: "minor_admin2@vetnary.io", role: "MINOR_ADMIN", firstName: "Mike", lastName: "Rajapaksa", phone: "0785678901", accountNumber: "VN-0009", isActive: true, createdAt: iso(80), updatedAt: iso(4) },
    { id: "u-010", email: "vet@cityvet.lk", role: "VET", firstName: "Chaminda", lastName: "Bandara", phone: "0776789012", accountNumber: "VN-0010", isActive: false, createdAt: iso(70), updatedAt: iso(15) },
];

// ─── Clinics ──────────────────────────────────────────────────────────────────

export const mockClinics: Clinic[] = [
    { id: "cl-001", name: "River Edge Veterinary Hospital", address: "42 Kandy Rd, Peradeniya", phone: "0812345678", operatingHours: "Mon–Sat 8am–6pm", status: "APPROVED", latitude: 7.2596, longitude: 80.5972, createdAt: iso(90), updatedAt: iso(5) },
    { id: "cl-002", name: "Pet Care Center", address: "15 Galle Rd, Colombo 03", phone: "0112345678", operatingHours: "Mon–Fri 9am–5pm", status: "APPROVED", latitude: 6.9147, longitude: 79.8586, createdAt: iso(85), updatedAt: iso(3) },
    { id: "cl-003", name: "Paws & Claws Clinic", address: "78 Temple Rd, Nugegoda", phone: "0113456789", operatingHours: "Mon–Sat 8am–7pm", status: "PENDING", createdAt: iso(10), updatedAt: iso(10) },
    { id: "cl-004", name: "City Vet Clinic", address: "5 Hospital Rd, Kandy", phone: "0814567890", operatingHours: "Mon–Fri 9am–6pm", status: "APPROVED", latitude: 7.2906, longitude: 80.6337, createdAt: iso(70), updatedAt: iso(15) },
    { id: "cl-005", name: "Green Valley Animal Hospital", address: "33 Matara Rd, Galle", phone: "0915678901", operatingHours: "Daily 8am–8pm", status: "PENDING", createdAt: iso(5), updatedAt: iso(5) },
    { id: "cl-006", name: "Companion Care Vet", address: "12 Lake Dr, Nuwara Eliya", phone: "0526789012", operatingHours: "Mon–Sat 9am–5pm", status: "REJECTED", createdAt: iso(30), updatedAt: iso(20) },
];

// ─── Pets ─────────────────────────────────────────────────────────────────────

export const mockPets: Pet[] = [
    { id: "p-001", ownerId: "u-005", name: "Max", species: "Dog", breed: "Golden Retriever", weight: 28.5, microchip: "MC-001122", isActive: true, createdAt: iso(50), updatedAt: iso(5), owner: { firstName: "Senith", lastName: "Udayakumara", email: "senith@gmail.com", phone: "0761234567" } },
    { id: "p-002", ownerId: "u-006", name: "Luna", species: "Cat", breed: "Persian", weight: 4.2, microchip: "MC-003344", isActive: true, createdAt: iso(45), updatedAt: iso(8), owner: { firstName: "Kasun", lastName: "Pathirana", email: "kasun@gmail.com", phone: "0752345678" } },
    { id: "p-003", ownerId: "u-008", name: "Rocky", species: "Dog", breed: "German Shepherd", weight: 34.0, microchip: "MC-005566", isActive: true, createdAt: iso(40), updatedAt: iso(3), owner: { firstName: "Nuwan", lastName: "Jayasekara", email: "nuwan@gmail.com", phone: "0734567890" } },
    { id: "p-004", ownerId: "u-005", name: "Bella", species: "Cat", breed: "Siamese", weight: 3.8, isActive: true, createdAt: iso(35), updatedAt: iso(10), owner: { firstName: "Senith", lastName: "Udayakumara", email: "senith@gmail.com", phone: "0761234567" } },
    { id: "p-005", ownerId: "u-007", name: "Charlie", species: "Dog", breed: "Labrador", weight: 31.0, microchip: "MC-007788", isActive: true, createdAt: iso(30), updatedAt: iso(7), owner: { firstName: "Nadeeka", lastName: "Senevirathne", email: "nadeeka@gmail.com", phone: "0743456789" } },
    { id: "p-006", ownerId: "u-006", name: "Coco", species: "Rabbit", breed: "Holland Lop", weight: 1.8, isActive: true, createdAt: iso(20), updatedAt: iso(2), owner: { firstName: "Kasun", lastName: "Pathirana", email: "kasun@gmail.com", phone: "0752345678" } },
    { id: "p-007", ownerId: "u-007", name: "Milo", species: "Dog", breed: "Beagle", weight: 12.5, microchip: "MC-009900", isActive: false, createdAt: iso(60), updatedAt: iso(30), owner: { firstName: "Nadeeka", lastName: "Senevirathne", email: "nadeeka@gmail.com", phone: "0743456789" } },
];

// ─── Appointments ─────────────────────────────────────────────────────────────

export const mockAppointments: Appointment[] = [
    { id: "apt-001", clinicId: "cl-001", ownerId: "u-005", vetId: "u-003", petId: "p-001", date: iso(0), status: "CONFIRMED", reason: "Annual checkup & vaccination", createdAt: iso(3), updatedAt: iso(0), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Senith", lastName: "Udayakumara" }, vet: { firstName: "Nimal", lastName: "Silva" }, pet: { name: "Max", species: "Dog" } },
    { id: "apt-002", clinicId: "cl-001", ownerId: "u-006", petId: "p-002", date: iso(0), status: "PENDING", reason: "Eye infection follow-up", createdAt: iso(2), updatedAt: iso(0), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Kasun", lastName: "Pathirana" }, pet: { name: "Luna", species: "Cat" } },
    { id: "apt-003", clinicId: "cl-002", ownerId: "u-008", vetId: "u-004", petId: "p-003", date: futureIso(2), status: "CONFIRMED", reason: "Hip dysplasia assessment", createdAt: iso(1), updatedAt: iso(0), clinic: { name: "Pet Care Center" }, owner: { firstName: "Nuwan", lastName: "Jayasekara" }, vet: { firstName: "Kamani", lastName: "Jayawardena" }, pet: { name: "Rocky", species: "Dog" } },
    { id: "apt-004", clinicId: "cl-001", ownerId: "u-005", petId: "p-004", date: futureIso(5), status: "PENDING", reason: "Spaying consultation", createdAt: iso(0), updatedAt: iso(0), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Senith", lastName: "Udayakumara" }, pet: { name: "Bella", species: "Cat" } },
    { id: "apt-005", clinicId: "cl-004", ownerId: "u-007", vetId: "u-010", petId: "p-005", date: iso(5), status: "COMPLETED", reason: "Dental cleaning", createdAt: iso(10), updatedAt: iso(5), clinic: { name: "City Vet Clinic" }, owner: { firstName: "Nadeeka", lastName: "Senevirathne" }, vet: { firstName: "Chaminda", lastName: "Bandara" }, pet: { name: "Charlie", species: "Dog" } },
    { id: "apt-006", clinicId: "cl-001", ownerId: "u-008", petId: "p-003", date: iso(2), status: "NO_SHOW", reason: "Vaccination booster", createdAt: iso(7), updatedAt: iso(2), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Nuwan", lastName: "Jayasekara" }, pet: { name: "Rocky", species: "Dog" } },
];

// ─── Medical Records ──────────────────────────────────────────────────────────

export const mockMedicalRecords: MedicalRecord[] = [
    { id: "mr-001", petId: "p-001", vetId: "u-003", clinicId: "cl-001", diagnosis: "Mild ear infection (otitis externa)", treatment: "Cleaned ear canal, prescribed Otomax drops", prescription: "Otomax 15g — apply 2x daily for 10 days", notes: "Recheck in 2 weeks. Owner advised to avoid water exposure.", recordDate: iso(15), createdAt: iso(15), vet: { firstName: "Nimal", lastName: "Silva" }, clinic: { name: "River Edge Veterinary Hospital" } },
    { id: "mr-002", petId: "p-001", vetId: "u-003", clinicId: "cl-001", diagnosis: "Annual wellness exam — all clear", treatment: "Physical exam, blood panel, heartworm test", notes: "Weight stable. Heart and lungs clear. Continue current diet.", recordDate: iso(5), createdAt: iso(5), vet: { firstName: "Nimal", lastName: "Silva" }, clinic: { name: "River Edge Veterinary Hospital" } },
    { id: "mr-003", petId: "p-002", vetId: "u-003", clinicId: "cl-001", diagnosis: "Conjunctivitis (left eye)", treatment: "Antibiotic eye drops prescribed", prescription: "Ciprofloxacin 0.3% eye drops — 3x daily for 7 days", notes: "Mild swelling observed. Monitor for worsening.", recordDate: iso(8), createdAt: iso(8), vet: { firstName: "Nimal", lastName: "Silva" }, clinic: { name: "River Edge Veterinary Hospital" } },
    { id: "mr-004", petId: "p-003", vetId: "u-004", clinicId: "cl-002", diagnosis: "Early-stage hip dysplasia (bilateral)", treatment: "Joint supplements started, weight management plan", prescription: "Glucosamine/Chondroitin 500mg daily, Omega-3 supplement", notes: "Recommend swimming therapy. Avoid high-impact activities. Follow-up X-ray in 3 months.", recordDate: iso(20), createdAt: iso(20), vet: { firstName: "Kamani", lastName: "Jayawardena" }, clinic: { name: "Pet Care Center" } },
    { id: "mr-005", petId: "p-005", vetId: "u-010", clinicId: "cl-004", diagnosis: "Dental calculus Grade II", treatment: "Professional dental scaling and polishing under anesthesia", notes: "Two teeth extracted (lower premolars). Prescribed soft food for 5 days.", recordDate: iso(5), createdAt: iso(5), vet: { firstName: "Chaminda", lastName: "Bandara" }, clinic: { name: "City Vet Clinic" } },
];

// ─── Vaccinations ─────────────────────────────────────────────────────────────

export const mockVaccinations: Vaccination[] = [
    { id: "v-001", petId: "p-001", clinicId: "cl-001", administeredById: "u-003", vaccineName: "Rabies (3-Year)", batchNumber: "RAB-2024-0442", nextDueDate: futureIso(365 * 2), recordDate: iso(5), createdAt: iso(5), administeredBy: { firstName: "Nimal", lastName: "Silva" }, clinic: { name: "River Edge Veterinary Hospital" } },
    { id: "v-002", petId: "p-001", clinicId: "cl-001", administeredById: "u-003", vaccineName: "DHPP (Distemper Combo)", batchNumber: "DHPP-2024-1185", nextDueDate: futureIso(365), recordDate: iso(5), createdAt: iso(5), administeredBy: { firstName: "Nimal", lastName: "Silva" }, clinic: { name: "River Edge Veterinary Hospital" } },
    { id: "v-003", petId: "p-002", clinicId: "cl-001", administeredById: "u-003", vaccineName: "FVRCP (Feline Core)", batchNumber: "FVR-2024-0887", nextDueDate: futureIso(180), recordDate: iso(30), createdAt: iso(30), administeredBy: { firstName: "Nimal", lastName: "Silva" }, clinic: { name: "River Edge Veterinary Hospital" } },
    { id: "v-004", petId: "p-003", clinicId: "cl-002", administeredById: "u-004", vaccineName: "Rabies (1-Year)", batchNumber: "RAB-2024-0998", nextDueDate: futureIso(90), recordDate: iso(275), createdAt: iso(275), administeredBy: { firstName: "Kamani", lastName: "Jayawardena" }, clinic: { name: "Pet Care Center" } },
    { id: "v-005", petId: "p-005", clinicId: "cl-004", administeredById: "u-010", vaccineName: "Bordetella (Kennel Cough)", batchNumber: "BOR-2025-0123", nextDueDate: futureIso(180), recordDate: iso(10), createdAt: iso(10), administeredBy: { firstName: "Chaminda", lastName: "Bandara" }, clinic: { name: "City Vet Clinic" } },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const mockInvoices: Invoice[] = [
    { id: "inv-001", clinicId: "cl-001", ownerId: "u-005", appointmentId: "apt-001", amount: 4500, status: "PENDING", issuedAt: iso(0), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Senith", lastName: "Udayakumara", email: "senith@gmail.com" } },
    { id: "inv-002", clinicId: "cl-001", ownerId: "u-006", amount: 2800, status: "PAID", issuedAt: iso(8), paidAt: iso(7), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Kasun", lastName: "Pathirana", email: "kasun@gmail.com" } },
    { id: "inv-003", clinicId: "cl-002", ownerId: "u-008", appointmentId: "apt-003", amount: 7500, status: "PENDING", issuedAt: iso(1), clinic: { name: "Pet Care Center" }, owner: { firstName: "Nuwan", lastName: "Jayasekara", email: "nuwan@gmail.com" } },
    { id: "inv-004", clinicId: "cl-004", ownerId: "u-007", appointmentId: "apt-005", amount: 12000, status: "PAID", issuedAt: iso(5), paidAt: iso(4), clinic: { name: "City Vet Clinic" }, owner: { firstName: "Nadeeka", lastName: "Senevirathne", email: "nadeeka@gmail.com" } },
    { id: "inv-005", clinicId: "cl-001", ownerId: "u-005", amount: 1500, status: "PAID", issuedAt: iso(15), paidAt: iso(14), clinic: { name: "River Edge Veterinary Hospital" }, owner: { firstName: "Senith", lastName: "Udayakumara", email: "senith@gmail.com" } },
];

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const mockSupportTickets: SupportTicket[] = [
    { id: "tk-001", ownerId: "u-005", targetClinicId: "cl-001", subject: "Discrepancy in vaccine bill", description: "I was charged Rs. 4500 for a rabies vaccine but the price listed on the clinic website says Rs. 3500. Please clarify.", status: "OPEN", createdAt: iso(1), updatedAt: iso(1), owner: { firstName: "Senith", lastName: "Udayakumara", email: "senith@gmail.com" }, targetClinic: { name: "River Edge Veterinary Hospital" } },
    { id: "tk-002", ownerId: "u-006", subject: "Cannot add second pet", description: "When I try to register my new kitten, the form gives a generic error. I've tried multiple times.", status: "IN_PROGRESS", createdAt: iso(3), updatedAt: iso(2), owner: { firstName: "Kasun", lastName: "Pathirana", email: "kasun@gmail.com" } },
    { id: "tk-003", ownerId: "u-007", targetClinicId: "cl-004", subject: "Requesting X-Ray report from Kandy Clinic", description: "I need the X-ray images from Charlie's dental procedure for my insurance claim. The clinic hasn't responded to my emails.", status: "OPEN", createdAt: iso(2), updatedAt: iso(2), owner: { firstName: "Nadeeka", lastName: "Senevirathne", email: "nadeeka@gmail.com" }, targetClinic: { name: "City Vet Clinic" } },
    { id: "tk-004", ownerId: "u-008", targetClinicId: "cl-001", subject: "Missed appointment not cancelled", description: "I called to cancel Rocky's appointment 24 hours in advance but it still shows as NO_SHOW on my account.", status: "RESOLVED", createdAt: iso(10), updatedAt: iso(7), owner: { firstName: "Nuwan", lastName: "Jayasekara", email: "nuwan@gmail.com" }, targetClinic: { name: "River Edge Veterinary Hospital" } },
];

// ─── Platform Stats ───────────────────────────────────────────────────────────

export const mockPlatformStats = {
    usersCount: mockUsers.length,
    clinicsCount: mockClinics.filter(c => c.status === "APPROVED").length,
    appointmentsCount: mockAppointments.length,
    totalRevenue: mockInvoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0),
};
