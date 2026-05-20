import {
  PrismaClient,
  Role,
  ClinicStatus,
  AppointmentStatus,
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
  const adminEmail = 'admin@vetnary.com';
  const customerEmail = 'user@vetnary.com';
  const vetEmail = 'vet@vetnary.com';

  const adminPasswordHash = await bcrypt.hash('admin@12345', 10);
  const customerPasswordHash = await bcrypt.hash('user@12345', 10);
  const vetPasswordHash = await bcrypt.hash('vet@12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: 'Main',
      lastName: 'Admin',
      role: Role.MAIN_ADMIN,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      firstName: 'Main',
      lastName: 'Admin',
      role: Role.MAIN_ADMIN,
      isActive: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      firstName: 'Sample',
      lastName: 'User',
      role: Role.CUSTOMER,
      phone: '+10000000001',
      isActive: true,
    },
    create: {
      email: customerEmail,
      passwordHash: customerPasswordHash,
      firstName: 'Sample',
      lastName: 'User',
      role: Role.CUSTOMER,
      phone: '+10000000001',
      isActive: true,
    },
  });

  const vet = await prisma.user.upsert({
    where: { email: vetEmail },
    update: {
      firstName: 'Sample',
      lastName: 'Vet',
      role: Role.VET,
      phone: '+10000000002',
      licenseCertificateUrl: null,
      isActive: true,
    },
    create: {
      email: vetEmail,
      passwordHash: vetPasswordHash,
      firstName: 'Sample',
      lastName: 'Vet',
      role: Role.VET,
      phone: '+10000000002',
      licenseCertificateUrl: null,
      isActive: true,
    },
  });

  let clinic = await prisma.clinic.findFirst({
    where: { name: 'Sample Vet Clinic' },
  });

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: 'Sample Vet Clinic',
        address: '123 Sample Street',
        phone: '+10000000003',
        operatingHours: 'Mon-Fri 09:00-18:00',
        status: ClinicStatus.APPROVED,
        ownerId: vet.id,
      },
    });
  }

  await prisma.clinicStaff.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: vet.id,
      },
    },
    update: {},
    create: {
      clinicId: clinic.id,
      userId: vet.id,
    },
  });

  let pet = await prisma.pet.findFirst({
    where: {
      ownerId: customer.id,
      name: 'Buddy',
    },
  });

  if (!pet) {
    pet = await prisma.pet.create({
      data: {
        ownerId: customer.id,
        name: 'Buddy',
        species: 'Dog',
        breed: 'Labrador Retriever',
        weight: 28.5,
        microchip: 'MC-0001',
        isActive: true,
      },
    });
  }

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      clinicId: clinic.id,
      ownerId: customer.id,
      petId: pet.id,
      vetId: vet.id,
    },
  });

  if (!existingAppointment) {
    await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        ownerId: customer.id,
        vetId: vet.id,
        petId: pet.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: AppointmentStatus.CONFIRMED,
        reason: 'Annual checkup',
      },
    });
  }

  console.log('Seed completed:', {
    adminId: admin.id,
    customerId: customer.id,
    vetId: vet.id,
    clinicId: clinic.id,
    petId: pet.id,
  });
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
