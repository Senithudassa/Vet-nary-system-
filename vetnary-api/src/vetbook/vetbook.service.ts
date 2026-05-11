import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto, CreateVaccinationDto, CreatePrescriptionDto } from './dto/vetbook.dto';
import { Role } from "@prisma/client";

@Injectable()
export class VetbookService {
  constructor(private prisma: PrismaService) {}

  async getPetTimeline(petId: string, userId: string, userRole: Role) {
    // Access control check (similar to PetsService)
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    if (userRole === Role.CUSTOMER && pet.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to view this pet history');
    }

    if (userRole === Role.VET) {
      const hasAppointment = await this.prisma.appointment.findFirst({
        where: {
          petId,
          clinic: { staff: { some: { userId } } },
        },
      });
      if (!hasAppointment) {
        throw new ForbiddenException('Not authorized to view this pet history (no appointment)');
      }
    }

    const [medicalRecords, vaccinations, prescriptions] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { petId },
        include: { clinic: true, vet: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.vaccination.findMany({
        where: { petId },
        include: { clinic: true, administeredBy: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.prescription.findMany({
        where: { petId },
        include: { clinic: true, vet: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    const timeline = [
      ...medicalRecords.map((r) => ({ ...r, type: 'MEDICAL' })),
      ...vaccinations.map((v) => ({ ...v, type: 'VACCINE', recordDate: v.recordDate })),
      ...prescriptions.map((p) => ({ ...p, type: 'PRESCRIPTION', recordDate: p.issuedAt })),
    ].sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

    return timeline;
  }

  async createMedicalRecord(petId: string, vetId: string, dto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({
      data: {
        ...dto,
        petId,
        vetId,
      },
    });
  }

  async createVaccination(petId: string, vetId: string, dto: CreateVaccinationDto) {
    return this.prisma.vaccination.create({
      data: {
        ...dto,
        petId,
        administeredById: vetId,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
      },
    });
  }

  async getClinicRecords(clinicId: string, userId: string) {
    // Check if the vet belongs to this clinic
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId, userId } },
    });
    if (!isStaff) {
      throw new ForbiddenException('Not authorized to view records for this clinic');
    }

    const [medicalRecords, vaccinations, prescriptions] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { clinicId },
        include: { pet: true, vet: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.vaccination.findMany({
        where: { clinicId },
        include: { pet: true, administeredBy: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.prescription.findMany({
        where: { clinicId },
        include: { pet: true, vet: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    return { medicalRecords, vaccinations, prescriptions };
  }

  async createPrescription(petId: string, vetId: string, dto: CreatePrescriptionDto) {
    return this.prisma.prescription.create({
      data: {
        ...dto,
        petId,
        vetId,
      },
    });
  }

  async deletePrescription(prescriptionId: string, userId: string, userRole: Role) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) throw new NotFoundException('Prescription not found');

    // Only the issuing vet or an admin should be able to delete?
    // Actually, following the pattern in other services:
    if (userRole === Role.VET && prescription.vetId !== userId) {
      throw new ForbiddenException('Not authorized to delete this prescription');
    }

    return this.prisma.prescription.delete({
      where: { id: prescriptionId },
    });
  }

  async getPetPrescriptions(petId: string) {
    return this.prisma.prescription.findMany({
      where: { petId },
      include: { clinic: true, vet: { select: { firstName: true, lastName: true } } },
    });
  }

  async getClinicPrescriptions(clinicId: string) {
    return this.prisma.prescription.findMany({
      where: { clinicId },
      include: { pet: true, vet: { select: { firstName: true, lastName: true } } },
    });
  }

  async getAppointmentPrescriptions(appointmentId: string) {
    return this.prisma.prescription.findMany({
      where: { appointmentId },
      include: { pet: true, vet: { select: { firstName: true, lastName: true } } },
    });
  }
}
