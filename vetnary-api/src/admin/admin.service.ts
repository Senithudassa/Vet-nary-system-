import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/admin.dto';
import { Role, TicketStatus } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createTicket(ownerId: string, dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        ...dto,
        ownerId,
        status: TicketStatus.OPEN,
      },
    });
  }

  async findAllTickets() {
    return this.prisma.supportTicket.findMany({
      include: { 
        owner: { select: { firstName: true, lastName: true, email: true, role: true } },
        targetClinic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTicket(id: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async getStats() {
    const [totalClinics, totalPets, totalRevenue] = await Promise.all([
      this.prisma.clinic.count(),
      this.prisma.pet.count({ where: { isActive: true } }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalClinics,
      activePets: totalPets,
      platformRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
