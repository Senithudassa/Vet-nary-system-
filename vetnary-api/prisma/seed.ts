import {
  PrismaClient,
  Role,
  ClinicStatus,
  AppointmentStatus,
  InvoiceStatus,
  TicketStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Hashed passwords ──────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin@12345', 10);
  const kasunHash = await bcrypt.hash('123123123', 10);
  const tharushaHash = await bcrypt.hash('123123123', 10);
  const sameeraHash = await bcrypt.hash('123123123', 10);
  const induwaraHash = await bcrypt.hash('123123123', 10);
  const sandaliHash = await bcrypt.hash('123123123', 10);

  // ── Users ─────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vetnary.com' },
    update: {
      firstName: 'Main',
      lastName: 'Admin',
      role: Role.MAIN_ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@vetnary.com',
      passwordHash: adminHash,
      firstName: 'Main',
      lastName: 'Admin',
      role: Role.MAIN_ADMIN,
      isActive: true,
    },
  });

  // Customer 1 – Kasun Perera
  const kasun = await prisma.user.upsert({
    where: { email: 'kasun@gmail.com' },
    update: {
      firstName: 'Kasun',
      lastName: 'Perera',
      role: Role.CUSTOMER,
      phone: '+94771230001',
      isActive: true,
    },
    create: {
      email: 'kasun@gmail.com',
      passwordHash: kasunHash,
      firstName: 'Kasun',
      lastName: 'Perera',
      role: Role.CUSTOMER,
      phone: '+94771230001',
      isActive: true,
    },
  });

  // Customer 2 – Tharusha Silva
  const tharusha = await prisma.user.upsert({
    where: { email: 'tharusha@gmail.com' },
    update: {
      firstName: 'Tharusha',
      lastName: 'Silva',
      role: Role.CUSTOMER,
      phone: '+94751230002',
      isActive: true,
    },
    create: {
      email: 'tharusha@gmail.com',
      passwordHash: tharushaHash,
      firstName: 'Tharusha',
      lastName: 'Silva',
      role: Role.CUSTOMER,
      phone: '+94751230002',
      isActive: true,
    },
  });

  // Customer 3 – Sameera Fernando
  const sameera = await prisma.user.upsert({
    where: { email: 'sameera@gmail.com' },
    update: {
      firstName: 'Sameera',
      lastName: 'Fernando',
      role: Role.CUSTOMER,
      phone: '+94701230003',
      isActive: true,
    },
    create: {
      email: 'sameera@gmail.com',
      passwordHash: sameeraHash,
      firstName: 'Sameera',
      lastName: 'Fernando',
      role: Role.CUSTOMER,
      phone: '+94701230003',
      isActive: true,
    },
  });

  // Vet 1 – Dr. Induwara Jayasooriya (owns Clinic 1 – APPROVED)
  const induwara = await prisma.user.upsert({
    where: { email: 'induwara@gmail.com' },
    update: {
      firstName: 'Induwara',
      lastName: 'Jayasooriya',
      role: Role.VET,
      phone: '+94771230004',
      licenseCertificateUrl:
        'https://media.licdn.com/dms/image/v2/D4D22AQHxHF0YitDtyQ/feedshare-shrink_800/feedshare-shrink_800/0/1724171169289?e=2147483647&v=beta&t=2HEYn5UOCZs6X7HSGYHE9dCKAZ6sKnz_WljlGwf0OBo',
      isActive: true,
    },
    create: {
      email: 'induwara@gmail.com',
      passwordHash: induwaraHash,
      firstName: 'Induwara',
      lastName: 'Jayasooriya',
      role: Role.VET,
      phone: '+94771230004',
      licenseCertificateUrl:
        'https://media.licdn.com/dms/image/v2/D4D22AQHxHF0YitDtyQ/feedshare-shrink_800/feedshare-shrink_800/0/1724171169289?e=2147483647&v=beta&t=2HEYn5UOCZs6X7HSGYHE9dCKAZ6sKnz_WljlGwf0OBo',
      isActive: true,
    },
  });

  // Vet 2 – Dr. Sandali Wickramasinghe (owns Clinic 2 – APPROVED, submitted Clinic 3 – PENDING)
  const sandali = await prisma.user.upsert({
    where: { email: 'sandali@gmail.com' },
    update: {
      firstName: 'Sandali',
      lastName: 'Wickramasinghe',
      role: Role.VET,
      phone: '+94751230005',
      licenseCertificateUrl:
        'https://ahcprime.co.uk/wp-content/uploads/2025/01/ov-bogdan.png',
      isActive: true,
    },
    create: {
      email: 'sandali@gmail.com',
      passwordHash: sandaliHash,
      firstName: 'Sandali',
      lastName: 'Wickramasinghe',
      role: Role.VET,
      phone: '+94751230005',
      licenseCertificateUrl:
        'https://ahcprime.co.uk/wp-content/uploads/2025/01/ov-bogdan.png',
      isActive: true,
    },
  });

  // ── Clinics (near Colombo, Sri Lanka) ─────────────────────────────────────
  // Clinic 1 – Colpetty (Colombo 03) – APPROVED
  let clinic1 = await prisma.clinic.findFirst({
    where: { name: 'Paws & Care Veterinary Clinic' },
  });
  if (!clinic1) {
    clinic1 = await prisma.clinic.create({
      data: {
        name: 'Paws & Care Veterinary Clinic',
        address: 'No. 42, Galle Road, Colpetty, Colombo 03',
        latitude: 6.89,
        longitude: 79.8576,
        phone: '+94112583456',
        operatingHours: 'Mon–Fri 08:00–18:00, Sat 09:00–14:00',
        status: ClinicStatus.APPROVED,
        ownerId: induwara.id,
      },
    });
  }

  // Clinic 2 – Nugegoda – APPROVED
  let clinic2 = await prisma.clinic.findFirst({
    where: { name: 'Green Hills Animal Hospital' },
  });
  if (!clinic2) {
    clinic2 = await prisma.clinic.create({
      data: {
        name: 'Green Hills Animal Hospital',
        address: 'No. 15, High Level Road, Nugegoda',
        latitude: 6.8731,
        longitude: 79.8891,
        phone: '+94112714567',
        operatingHours: 'Mon–Sun 07:00–20:00',
        status: ClinicStatus.APPROVED,
        ownerId: sandali.id,
      },
    });
  }

  // Clinic 3 – Dehiwala – PENDING (Sandali's second clinic application, awaiting approval)
  let clinic3 = await prisma.clinic.findFirst({
    where: { name: 'Dehiwala Pet Care Center' },
  });
  if (!clinic3) {
    clinic3 = await prisma.clinic.create({
      data: {
        name: 'Dehiwala Pet Care Center',
        address: 'No. 88, Galle Road, Dehiwala',
        latitude: 6.8548,
        longitude: 79.865,
        phone: '+94112425678',
        operatingHours: 'Mon–Fri 09:00–17:00',
        status: ClinicStatus.PENDING,
        ownerId: sandali.id,
      },
    });
  }

  // ── Clinic Staff ──────────────────────────────────────────────────────────
  for (const { clinicId, userId } of [
    { clinicId: clinic1.id, userId: induwara.id },
    { clinicId: clinic1.id, userId: sandali.id }, // Sandali also covers Clinic 1
    { clinicId: clinic2.id, userId: sandali.id },
    { clinicId: clinic3.id, userId: sandali.id },
  ]) {
    await prisma.clinicStaff.upsert({
      where: { clinicId_userId: { clinicId, userId } },
      update: {},
      create: { clinicId, userId },
    });
  }

  // ── Pets ──────────────────────────────────────────────────────────────────
  // Kasun's pets (3): Max ✓  Whiskers ✓  Nemo ✗
  let petMax = await prisma.pet.findFirst({
    where: { ownerId: kasun.id, name: 'Max' },
  });
  if (!petMax) {
    petMax = await prisma.pet.create({
      data: {
        ownerId: kasun.id,
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        weight: 32.0,
        microchip: 'MC-K001',
        isActive: true,
        isVerified: true,
      },
    });
  }

  let petWhiskers = await prisma.pet.findFirst({
    where: { ownerId: kasun.id, name: 'Whiskers' },
  });
  if (!petWhiskers) {
    petWhiskers = await prisma.pet.create({
      data: {
        ownerId: kasun.id,
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Persian',
        weight: 4.2,
        microchip: 'MC-K002',
        isActive: true,
        isVerified: true,
      },
    });
  }

  let petNemo = await prisma.pet.findFirst({
    where: { ownerId: kasun.id, name: 'Nemo' },
  });
  if (!petNemo) {
    petNemo = await prisma.pet.create({
      data: {
        ownerId: kasun.id,
        name: 'Nemo',
        species: 'Fish',
        breed: 'Goldfish',
        weight: 0.05,
        isActive: true,
        isVerified: false,
      },
    });
  }

  // Tharusha's pets (3): Bella ✓  Luna ✗  Rocky ✗
  let petBella = await prisma.pet.findFirst({
    where: { ownerId: tharusha.id, name: 'Bella' },
  });
  if (!petBella) {
    petBella = await prisma.pet.create({
      data: {
        ownerId: tharusha.id,
        name: 'Bella',
        species: 'Dog',
        breed: 'Beagle',
        weight: 10.5,
        microchip: 'MC-T001',
        isActive: true,
        isVerified: true,
      },
    });
  }

  let petLuna = await prisma.pet.findFirst({
    where: { ownerId: tharusha.id, name: 'Luna' },
  });
  if (!petLuna) {
    petLuna = await prisma.pet.create({
      data: {
        ownerId: tharusha.id,
        name: 'Luna',
        species: 'Cat',
        breed: 'Siamese',
        weight: 3.8,
        microchip: 'MC-T002',
        isActive: true,
        isVerified: false,
      },
    });
  }

  let petRocky = await prisma.pet.findFirst({
    where: { ownerId: tharusha.id, name: 'Rocky' },
  });
  if (!petRocky) {
    petRocky = await prisma.pet.create({
      data: {
        ownerId: tharusha.id,
        name: 'Rocky',
        species: 'Dog',
        breed: 'German Shepherd',
        weight: 35.0,
        isActive: true,
        isVerified: false,
      },
    });
  }

  // Sameera's pets (3): Tommy ✓  Mia ✗  Leo ✗
  let petTommy = await prisma.pet.findFirst({
    where: { ownerId: sameera.id, name: 'Tommy' },
  });
  if (!petTommy) {
    petTommy = await prisma.pet.create({
      data: {
        ownerId: sameera.id,
        name: 'Tommy',
        species: 'Dog',
        breed: 'Pomeranian',
        weight: 3.2,
        microchip: 'MC-S001',
        isActive: true,
        isVerified: true,
      },
    });
  }

  let petMia = await prisma.pet.findFirst({
    where: { ownerId: sameera.id, name: 'Mia' },
  });
  if (!petMia) {
    petMia = await prisma.pet.create({
      data: {
        ownerId: sameera.id,
        name: 'Mia',
        species: 'Cat',
        breed: 'Maine Coon',
        weight: 5.1,
        isActive: true,
        isVerified: false,
      },
    });
  }

  let petLeo = await prisma.pet.findFirst({
    where: { ownerId: sameera.id, name: 'Leo' },
  });
  if (!petLeo) {
    petLeo = await prisma.pet.create({
      data: {
        ownerId: sameera.id,
        name: 'Leo',
        species: 'Dog',
        breed: 'Dachshund',
        weight: 7.4,
        isActive: true,
        isVerified: false,
      },
    });
  }

  // ── Appointments ──────────────────────────────────────────────────────────
  const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);
  const daysAway = (n: number) => new Date(Date.now() + n * 864e5);

  // Kasun / Max / Clinic1 / Induwara — COMPLETED (30 days ago)
  let apptMaxDone = await prisma.appointment.findFirst({
    where: {
      petId: petMax.id,
      clinicId: clinic1.id,
      status: AppointmentStatus.COMPLETED,
    },
  });
  if (!apptMaxDone) {
    apptMaxDone = await prisma.appointment.create({
      data: {
        clinicId: clinic1.id,
        ownerId: kasun.id,
        vetId: induwara.id,
        petId: petMax.id,
        date: daysAgo(30),
        status: AppointmentStatus.COMPLETED,
        reason: 'Annual health checkup',
      },
    });
  }

  // Kasun / Whiskers / Clinic2 / Sandali — CONFIRMED (7 days from now)
  let apptWhiskersConfirmed = await prisma.appointment.findFirst({
    where: {
      petId: petWhiskers.id,
      clinicId: clinic2.id,
      status: AppointmentStatus.CONFIRMED,
    },
  });
  if (!apptWhiskersConfirmed) {
    apptWhiskersConfirmed = await prisma.appointment.create({
      data: {
        clinicId: clinic2.id,
        ownerId: kasun.id,
        vetId: sandali.id,
        petId: petWhiskers.id,
        date: daysAway(7),
        status: AppointmentStatus.CONFIRMED,
        reason: 'Dental cleaning and routine checkup',
      },
    });
  }

  // Kasun / Nemo / Clinic1 — PENDING (14 days from now, no vet assigned yet)
  let apptNemoPending = await prisma.appointment.findFirst({
    where: { petId: petNemo.id, status: AppointmentStatus.PENDING },
  });
  if (!apptNemoPending) {
    apptNemoPending = await prisma.appointment.create({
      data: {
        clinicId: clinic1.id,
        ownerId: kasun.id,
        petId: petNemo.id,
        date: daysAway(14),
        status: AppointmentStatus.PENDING,
        reason: 'General wellness check for new fish',
      },
    });
  }

  // Tharusha / Bella / Clinic1 / Induwara — COMPLETED (7 days ago)
  let apptBellaDone = await prisma.appointment.findFirst({
    where: {
      petId: petBella.id,
      clinicId: clinic1.id,
      status: AppointmentStatus.COMPLETED,
    },
  });
  if (!apptBellaDone) {
    apptBellaDone = await prisma.appointment.create({
      data: {
        clinicId: clinic1.id,
        ownerId: tharusha.id,
        vetId: induwara.id,
        petId: petBella.id,
        date: daysAgo(7),
        status: AppointmentStatus.COMPLETED,
        reason: 'Vaccination booster and weight check',
      },
    });
  }

  // Tharusha / Luna / Clinic2 — PENDING (3 days from now, no vet assigned yet)
  let apptLunaPending = await prisma.appointment.findFirst({
    where: { petId: petLuna.id, status: AppointmentStatus.PENDING },
  });
  if (!apptLunaPending) {
    apptLunaPending = await prisma.appointment.create({
      data: {
        clinicId: clinic2.id,
        ownerId: tharusha.id,
        petId: petLuna.id,
        date: daysAway(3),
        status: AppointmentStatus.PENDING,
        reason: 'First visit — new pet registration',
      },
    });
  }

  // Tharusha / Rocky / Clinic1 / Induwara — CANCELLED
  let apptRockyCancelled = await prisma.appointment.findFirst({
    where: { petId: petRocky.id, status: AppointmentStatus.CANCELLED },
  });
  if (!apptRockyCancelled) {
    apptRockyCancelled = await prisma.appointment.create({
      data: {
        clinicId: clinic1.id,
        ownerId: tharusha.id,
        vetId: induwara.id,
        petId: petRocky.id,
        date: daysAgo(7),
        status: AppointmentStatus.CANCELLED,
        reason: 'Hip dysplasia screening',
      },
    });
  }

  // Sameera / Tommy / Clinic1 — PENDING (10 days from now, no vet assigned yet)
  if (
    !(await prisma.appointment.findFirst({
      where: { petId: petTommy.id, status: AppointmentStatus.PENDING },
    }))
  ) {
    await prisma.appointment.create({
      data: {
        clinicId: clinic1.id,
        ownerId: sameera.id,
        petId: petTommy.id,
        date: daysAway(10),
        status: AppointmentStatus.PENDING,
        reason: 'Routine checkup and vaccination review',
      },
    });
  }

  // ── Medical Records ───────────────────────────────────────────────────────
  let medMax = await prisma.medicalRecord.findFirst({
    where: { petId: petMax.id },
  });
  if (!medMax) {
    medMax = await prisma.medicalRecord.create({
      data: {
        petId: petMax.id,
        vetId: induwara.id,
        clinicId: clinic1.id,
        diagnosis: 'Mild ear infection (otitis externa)',
        treatment:
          'Ear canal cleaned; topical antibiotic drops applied. Oral Amoxicillin prescribed for 7 days.',
        prescription: 'Amoxicillin 250 mg twice daily for 7 days',
        notes:
          'Schedule follow-up in 2 weeks if symptoms persist. Body weight within normal range.',
        recordDate: daysAgo(30),
      },
    });
  }

  let medBella = await prisma.medicalRecord.findFirst({
    where: { petId: petBella.id },
  });
  if (!medBella) {
    medBella = await prisma.medicalRecord.create({
      data: {
        petId: petBella.id,
        vetId: induwara.id,
        clinicId: clinic1.id,
        diagnosis: 'Mild gastrointestinal upset',
        treatment:
          'Bland diet (boiled chicken and rice) recommended for 3 days. Metronidazole prescribed.',
        prescription: 'Metronidazole 200 mg once daily for 5 days',
        notes:
          'Avoid fatty foods. Probiotics recommended after antibiotic course. Monitor stool consistency.',
        recordDate: daysAgo(7),
      },
    });
  }

  // ── Vaccinations ──────────────────────────────────────────────────────────
  // Max – Rabies
  if (
    !(await prisma.vaccination.findFirst({
      where: { petId: petMax.id, vaccineName: 'Rabies' },
    }))
  ) {
    await prisma.vaccination.create({
      data: {
        petId: petMax.id,
        clinicId: clinic1.id,
        administeredById: induwara.id,
        vaccineName: 'Rabies',
        batchNumber: 'RB-2024-0041',
        nextDueDate: daysAway(365),
        recordDate: daysAgo(30),
      },
    });
  }

  // Max – DHPP
  if (
    !(await prisma.vaccination.findFirst({
      where: { petId: petMax.id, vaccineName: 'DHPP' },
    }))
  ) {
    await prisma.vaccination.create({
      data: {
        petId: petMax.id,
        clinicId: clinic1.id,
        administeredById: induwara.id,
        vaccineName: 'DHPP',
        batchNumber: 'DH-2024-0088',
        nextDueDate: daysAway(365),
        recordDate: daysAgo(30),
      },
    });
  }

  // Whiskers – FVRCP
  if (
    !(await prisma.vaccination.findFirst({
      where: { petId: petWhiskers.id, vaccineName: 'FVRCP' },
    }))
  ) {
    await prisma.vaccination.create({
      data: {
        petId: petWhiskers.id,
        clinicId: clinic2.id,
        administeredById: sandali.id,
        vaccineName: 'FVRCP',
        batchNumber: 'FV-2024-0033',
        nextDueDate: daysAway(180),
        recordDate: daysAgo(60),
      },
    });
  }

  // Bella – Bordetella
  if (
    !(await prisma.vaccination.findFirst({
      where: { petId: petBella.id, vaccineName: 'Bordetella' },
    }))
  ) {
    await prisma.vaccination.create({
      data: {
        petId: petBella.id,
        clinicId: clinic1.id,
        administeredById: induwara.id,
        vaccineName: 'Bordetella',
        batchNumber: 'BO-2024-0019',
        nextDueDate: daysAway(180),
        recordDate: daysAgo(7),
      },
    });
  }

  // Bella – Rabies (due in 30 days — useful for upcoming reminder demo)
  if (
    !(await prisma.vaccination.findFirst({
      where: { petId: petBella.id, vaccineName: 'Rabies' },
    }))
  ) {
    await prisma.vaccination.create({
      data: {
        petId: petBella.id,
        clinicId: clinic1.id,
        administeredById: induwara.id,
        vaccineName: 'Rabies',
        batchNumber: 'RB-2023-0077',
        nextDueDate: daysAway(30),
        recordDate: daysAgo(335),
      },
    });
  }

  // ── Prescriptions ─────────────────────────────────────────────────────────
  // Max – Amoxicillin
  if (
    !(await prisma.prescription.findFirst({
      where: { petId: petMax.id, medicineName: 'Amoxicillin' },
    }))
  ) {
    await prisma.prescription.create({
      data: {
        petId: petMax.id,
        vetId: induwara.id,
        clinicId: clinic1.id,
        medicalRecordId: medMax.id,
        appointmentId: apptMaxDone.id,
        medicineName: 'Amoxicillin',
        dosage: '250 mg',
        frequency: 'Twice daily',
        duration: '7 days',
        notes:
          'Administer with food. Complete the full course even if symptoms improve.',
      },
    });
  }

  // Bella – Metronidazole
  if (
    !(await prisma.prescription.findFirst({
      where: { petId: petBella.id, medicineName: 'Metronidazole' },
    }))
  ) {
    await prisma.prescription.create({
      data: {
        petId: petBella.id,
        vetId: induwara.id,
        clinicId: clinic1.id,
        medicalRecordId: medBella.id,
        appointmentId: apptBellaDone.id,
        medicineName: 'Metronidazole',
        dosage: '200 mg',
        frequency: 'Once daily',
        duration: '5 days',
        notes: 'Give with a small amount of food to prevent nausea.',
      },
    });
  }

  // Whiskers – Clindamycin (pre-op for upcoming dental appointment)
  if (
    !(await prisma.prescription.findFirst({
      where: { petId: petWhiskers.id, medicineName: 'Clindamycin' },
    }))
  ) {
    await prisma.prescription.create({
      data: {
        petId: petWhiskers.id,
        vetId: sandali.id,
        clinicId: clinic2.id,
        appointmentId: apptWhiskersConfirmed.id,
        medicineName: 'Clindamycin',
        dosage: '25 mg',
        frequency: 'Once daily',
        duration: '5 days',
        notes:
          'Pre-operative antibiotic prophylaxis before dental procedure. Start 2 days before appointment.',
      },
    });
  }

  // ── Invoices ──────────────────────────────────────────────────────────────
  // Max's completed appointment – PAID
  if (
    !(await prisma.invoice.findFirst({
      where: { ownerId: kasun.id, appointmentId: apptMaxDone.id },
    }))
  ) {
    await prisma.invoice.create({
      data: {
        clinicId: clinic1.id,
        ownerId: kasun.id,
        appointmentId: apptMaxDone.id,
        amount: 4500.0,
        status: InvoiceStatus.PAID,
        paidAt: daysAgo(30),
      },
    });
  }

  // Bella's completed appointment – PAID
  if (
    !(await prisma.invoice.findFirst({
      where: { ownerId: tharusha.id, appointmentId: apptBellaDone.id },
    }))
  ) {
    await prisma.invoice.create({
      data: {
        clinicId: clinic1.id,
        ownerId: tharusha.id,
        appointmentId: apptBellaDone.id,
        amount: 3200.0,
        status: InvoiceStatus.PAID,
        paidAt: daysAgo(7),
      },
    });
  }

  // Whiskers' upcoming appointment – PENDING payment
  if (
    !(await prisma.invoice.findFirst({
      where: { ownerId: kasun.id, appointmentId: apptWhiskersConfirmed.id },
    }))
  ) {
    await prisma.invoice.create({
      data: {
        clinicId: clinic2.id,
        ownerId: kasun.id,
        appointmentId: apptWhiskersConfirmed.id,
        amount: 3800.0,
        status: InvoiceStatus.PENDING,
      },
    });
  }

  // ── Support Tickets ───────────────────────────────────────────────────────
  // Kasun – OPEN ticket (no assignee yet)
  if (
    !(await prisma.supportTicket.findFirst({ where: { ownerId: kasun.id } }))
  ) {
    await prisma.supportTicket.create({
      data: {
        ownerId: kasun.id,
        targetClinicId: clinic1.id,
        subject: 'Unable to reschedule appointment',
        description:
          'I have been trying to reschedule my appointment for Max but the system keeps showing an error when I change the date. Please assist.',
        status: TicketStatus.OPEN,
      },
    });
  }

  // Tharusha – IN_PROGRESS ticket, assigned to admin
  if (
    !(await prisma.supportTicket.findFirst({ where: { ownerId: tharusha.id } }))
  ) {
    await prisma.supportTicket.create({
      data: {
        ownerId: tharusha.id,
        assignedAdminId: admin.id,
        subject: 'Incorrect invoice amount',
        description:
          "The invoice for Bella's last appointment shows Rs. 3,200 but I was verbally quoted Rs. 2,800. Please review and correct the charge.",
        status: TicketStatus.IN_PROGRESS,
      },
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('✅ Seed completed successfully');
  console.log('');
  console.log('Users:');
  console.log('  Admin   : admin@vetnary.com   /  admin@12345');
  console.log('  Customer: kasun@gmail.com     /  123123123');
  console.log('  Customer: tharusha@gmail.com  /  123123123');
  console.log('  Customer: sameera@gmail.com   /  123123123');
  console.log(
    '  Vet     : induwara@gmail.com  /  123123123  (Paws & Care – APPROVED)',
  );
  console.log(
    '  Vet     : sandali@gmail.com   /  123123123  (Green Hills – APPROVED | Dehiwala – PENDING)',
  );
  console.log('');
  console.log('Clinics (near Colombo):');
  console.log(
    '  Paws & Care Veterinary Clinic  →  Galle Road, Colombo 03   – APPROVED',
  );
  console.log(
    '  Green Hills Animal Hospital    →  High Level Road, Nugegoda – APPROVED',
  );
  console.log(
    '  Dehiwala Pet Care Center       →  Galle Road, Dehiwala      – PENDING',
  );
  console.log('');
  console.log('Pets:');
  console.log('  Kasun   : Max ✓ | Whiskers ✓ | Nemo ✗ (pending)');
  console.log('  Tharusha: Bella ✓ | Luna ✗ (pending) | Rocky ✗ (pending)');
  console.log('  Sameera : Tommy ✓ | Mia ✗ (pending) | Leo ✗ (pending)');
  console.log('');
  console.log('Appointments:');
  console.log('  Max/Kasun      → Clinic1 / Dr. Induwara – COMPLETED');
  console.log('  Whiskers/Kasun → Clinic2 / Dr. Sandali  – CONFIRMED');
  console.log('  Nemo/Kasun     → Clinic1                – PENDING (no vet)');
  console.log('  Bella/Tharusha → Clinic1 / Dr. Induwara – COMPLETED');
  console.log('  Luna/Tharusha  → Clinic2                – PENDING (no vet)');
  console.log('  Rocky/Tharusha → Clinic1 / Dr. Induwara – CANCELLED');
  console.log('  Tommy/Sameera  → Clinic1                – PENDING (no vet)');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
