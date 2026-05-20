import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TicketStatus } from '@prisma/client';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';

const MAIN_ADMIN_ID = 'fe5551ce-3fdd-44ef-b490-21d6e02bd4d1';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(ownerId: string, ownerRole: Role, dto: CreateTicketDto) {
    if (dto.targetClinicId) {
      await this.assertClinicExists(dto.targetClinicId);
    }

    if (ownerRole === Role.CUSTOMER) {
      if (!dto.assignedVetId) {
        throw new BadRequestException('Customers must select a vet');
      }
      if (dto.assignedAdminId) {
        throw new ForbiddenException(
          'Customers cannot assign tickets directly to admins',
        );
      }
      await this.assertUserRole(dto.assignedVetId, Role.VET, 'Vet');
      if (dto.targetClinicId) {
        await this.assertVetInClinic(dto.assignedVetId, dto.targetClinicId);
      }
    } else if (ownerRole === Role.VET) {
      if (dto.assignedVetId && dto.assignedVetId !== ownerId) {
        throw new ForbiddenException(
          'Vets can only assign tickets to themselves',
        );
      }
      if (dto.assignedAdminId) {
        await this.assertAdminRole(dto.assignedAdminId);
      }
      if (dto.targetClinicId && dto.assignedVetId) {
        await this.assertVetInClinic(dto.assignedVetId, dto.targetClinicId);
      }
    } else {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.supportTicket.create({
      data: {
        subject: dto.subject,
        description: dto.description,
        targetClinicId: dto.targetClinicId,
        assignedVetId: dto.assignedVetId,
        assignedAdminId: dto.assignedAdminId,
        ownerId,
        status: TicketStatus.OPEN,
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        assignedVet: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedAdmin: {
          select: { firstName: true, lastName: true, email: true },
        },
        targetClinic: true,
      },
    });
  }

  async listAllTickets() {
    return this.prisma.supportTicket.findMany({
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        assignedVet: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedAdmin: {
          select: { firstName: true, lastName: true, email: true },
        },
        targetClinic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMyTickets(ownerId: string) {
    return this.prisma.supportTicket.findMany({
      where: { ownerId },
      include: {
        assignedVet: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedAdmin: {
          select: { firstName: true, lastName: true, email: true },
        },
        targetClinic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAssignedTickets(userId: string, role: Role) {
    if (role === Role.VET) {
      return this.prisma.supportTicket.findMany({
        where: { assignedVetId: userId },
        include: {
          owner: { select: { firstName: true, lastName: true, email: true } },
          targetClinic: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (role === Role.MAIN_ADMIN || role === Role.MINOR_ADMIN) {
      return this.prisma.supportTicket.findMany({
        where: { assignedAdminId: userId },
        include: {
          owner: { select: { firstName: true, lastName: true, email: true } },
          assignedVet: {
            select: { firstName: true, lastName: true, email: true },
          },
          targetClinic: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Not authorized');
  }

  async updateTicket(
    id: string,
    actorId: string,
    actorRole: Role,
    dto: UpdateTicketDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!dto.status && !dto.assignedVetId && !dto.assignedAdminId) {
      throw new BadRequestException('Update payload is required');
    }

    if (actorRole === Role.VET) {
      const isOwner = ticket.ownerId === actorId;
      const isAssigned = ticket.assignedVetId === actorId;
      if (!isOwner && !isAssigned) {
        throw new ForbiddenException('Not authorized');
      }

      if (dto.assignedVetId && dto.assignedVetId !== ticket.assignedVetId) {
        throw new ForbiddenException('Vets cannot reassign vet ownership');
      }

      if (dto.assignedAdminId) {
        await this.assertAdminRole(dto.assignedAdminId);
      }
    }

    if (actorRole === Role.MAIN_ADMIN || actorRole === Role.MINOR_ADMIN) {
      if (dto.assignedVetId) {
        await this.assertUserRole(dto.assignedVetId, Role.VET, 'Vet');
        if (ticket.targetClinicId) {
          await this.assertVetInClinic(
            dto.assignedVetId,
            ticket.targetClinicId,
          );
        }
      }
      if (dto.assignedAdminId) {
        await this.assertAdminRole(dto.assignedAdminId);
      }
    }

    if (
      actorRole !== Role.VET &&
      actorRole !== Role.MAIN_ADMIN &&
      actorRole !== Role.MINOR_ADMIN
    ) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: dto.status,
        assignedVetId: dto.assignedVetId,
        assignedAdminId: dto.assignedAdminId,
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        assignedVet: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedAdmin: {
          select: { firstName: true, lastName: true, email: true },
        },
        targetClinic: true,
      },
    });
  }

  async escalateTicket(id: string, vetId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.assignedVetId && ticket.assignedVetId !== vetId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.assertAdminRole(MAIN_ADMIN_ID);

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        assignedAdminId: MAIN_ADMIN_ID,
        status: TicketStatus.IN_PROGRESS,
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        assignedVet: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedAdmin: {
          select: { firstName: true, lastName: true, email: true },
        },
        targetClinic: true,
      },
    });
  }

  private async assertClinicExists(clinicId: string): Promise<void> {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
  }

  private async assertUserRole(
    userId: string,
    role: Role,
    label: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== role) {
      throw new BadRequestException(`${label} role is required`);
    }
  }

  private async assertAdminRole(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.MAIN_ADMIN && user.role !== Role.MINOR_ADMIN) {
      throw new BadRequestException('Admin role is required');
    }
  }

  private async assertVetInClinic(vetId: string, clinicId: string) {
    const isStaff = await this.prisma.clinicStaff.findUnique({
      where: { clinicId_userId: { clinicId, userId: vetId } },
    });
    if (!isStaff) {
      throw new BadRequestException(
        'Selected vet is not assigned to this clinic',
      );
    }
  }
}
