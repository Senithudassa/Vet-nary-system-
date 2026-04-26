import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClinicStatusDto, UpdateClinicDto, AddStaffDto } from './dto/clinics.dto';
import { ClinicStatus } from "@prisma/client";

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.clinic.findMany({
      where: { status: ClinicStatus.APPROVED },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        operatingHours: true,
      },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return clinic;
  }

  async updateStatus(id: string, dto: UpdateClinicStatusDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return this.prisma.clinic.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async updateClinic(id: string, userId: string, userRole: string, dto: UpdateClinicDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    if (userRole !== 'MAIN_ADMIN') {
      const isStaff = await this.prisma.clinicStaff.findUnique({
        where: { clinicId_userId: { clinicId: id, userId } },
      });
      if (!isStaff) {
        throw new ForbiddenException('Not authorized to update this clinic');
      }
    }

    return this.prisma.clinic.update({
      where: { id },
      data: dto,
    });
  }

  async getStaff(id: string) {
    const staff = await this.prisma.clinicStaff.findMany({
      where: { clinicId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
          },
        },
      },
    });
    return staff.map((s) => s.user);
  }

  async addStaff(id: string, dto: AddStaffDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return this.prisma.clinicStaff.create({
      data: {
        clinicId: id,
        userId: dto.userId,
      },
    });
  }
}
