import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoices.dto';
import { InvoiceStatus, Role } from "@prisma/client";

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(vetId: string, dto: CreateInvoiceDto) {
    // Check if vet belongs to clinic
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId: dto.clinicId, userId: vetId } },
    });
    if (!isStaff) throw new ForbiddenException('Not authorized');

    return this.prisma.invoice.create({
      data: {
        clinicId: dto.clinicId,
        ownerId: dto.ownerId,
        appointmentId: dto.appointmentId,
        amount: dto.amount,
        status: InvoiceStatus.PENDING,
      },
    });
  }

  async findClinicInvoices(clinicId: string, userId: string) {
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId, userId } },
    });
    if (!isStaff) throw new ForbiddenException('Not authorized');

    return this.prisma.invoice.findMany({
      where: { clinicId },
      include: { owner: { select: { firstName: true, lastName: true, email: true } }, appointment: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findMe(ownerId: string) {
    return this.prisma.invoice.findMany({
      where: { ownerId },
      include: { clinic: true, appointment: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async pay(id: string, userId: string, userRole: Role) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { clinic: { include: { staff: true } } },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    if (userRole === Role.CUSTOMER && invoice.ownerId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (userRole === Role.VET) {
      const isStaff = invoice.clinic.staff.some((s) => s.userId === userId);
      if (!isStaff) throw new ForbiddenException('Not authorized');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { 
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });
  }
}
