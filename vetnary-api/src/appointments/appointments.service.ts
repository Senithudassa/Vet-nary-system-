import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto, AddToQueueDto } from './dto/appointments.dto';
import { AppointmentStatus, Role } from "@prisma/client";

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        clinicId: dto.clinicId,
        petId: dto.petId,
        ownerId: ownerId,
        date: new Date(dto.date),
        reason: dto.reason,
        status: AppointmentStatus.PENDING,
      },
    });
  }

  async findMe(ownerId: string) {
    return this.prisma.appointment.findMany({
      where: { ownerId },
      include: { clinic: true, pet: true, vet: { select: { firstName: true, lastName: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findClinicAppointments(clinicId: string, userId: string) {
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId, userId } },
    });
    if (!isStaff) throw new ForbiddenException('Not authorized');

    return this.prisma.appointment.findMany({
      where: { clinicId },
      include: { pet: true, owner: { select: { firstName: true, lastName: true, phone: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async updateStatus(id: string, userId: string, userRole: Role, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { clinic: { include: { staff: true } } },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (userRole === Role.CUSTOMER && appointment.ownerId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (userRole === Role.VET) {
      const isStaff = appointment.clinic.staff.some((s) => s.userId === userId);
      if (!isStaff) throw new ForbiddenException('Not authorized');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async getQueue(clinicId: string, userId: string) {
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId, userId } },
    });
    if (!isStaff) throw new ForbiddenException('Not authorized');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        clinicId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      include: { pet: true, owner: { select: { firstName: true, lastName: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async addToQueue(clinicId: string, userId: string, dto: AddToQueueDto) {
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId, userId } },
    });
    if (!isStaff) throw new ForbiddenException('Not authorized');

    // If an appointment exists, mark it as CONFIRMED (representing arrival)
    if (dto.appointmentId) {
      return this.prisma.appointment.update({
        where: { id: dto.appointmentId },
        data: { status: AppointmentStatus.CONFIRMED },
      });
    }

    // Otherwise, create a "walk-in" appointment for now
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    return this.prisma.appointment.create({
      data: {
        clinicId,
        petId: dto.petId,
        ownerId: pet.ownerId,
        date: new Date(),
        status: AppointmentStatus.CONFIRMED,
        reason: 'Walk-in / Queue Arrival',
      },
    });
  }
}
