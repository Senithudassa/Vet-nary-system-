import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalActiveClients,
      totalAppointments,
      totalRevenueResult,
      totalRegisteredPets,
      totalOpenTickets,
      pendingInvoices,
      pendingVets,
      appointmentsByStatusRaw,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { role: Role.CUSTOMER, isActive: true },
      }),
      this.prisma.appointment.count(),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.pet.count(),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.invoice.count({ where: { status: 'PENDING' } }),
      this.prisma.clinic.count({ where: { status: 'PENDING' } }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const appointmentsByStatus = appointmentsByStatusRaw.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalUsers,
      totalActiveClients,
      totalAppointments,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      totalRegisteredPets,
      totalOpenTickets,
      pendingInvoices,
      pendingVets,
      appointmentsByStatus,
    };
  }
}
