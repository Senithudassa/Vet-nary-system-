import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto, UpdatePetDto } from './dto/pets.dto';
import { Role } from "@prisma/client";

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId: string) {
    return this.prisma.pet.findMany({
      where: { ownerId, isActive: true },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!pet || !pet.isActive) {
      throw new NotFoundException('Pet not found');
    }

    if (userRole === Role.CUSTOMER && pet.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to view this pet');
    }

    if (userRole === Role.VET) {
      // Check if an appointment exists for this pet with this vet's clinic
      const hasAppointment = await this.prisma.appointment.findFirst({
        where: {
          petId: id,
          clinic: {
            staff: {
              some: { userId },
            },
          },
        },
      });
      if (!hasAppointment) {
        throw new ForbiddenException('Not authorized to view this pet (no associated appointment)');
      }
    }

    return pet;
  }

  async create(ownerId: string, dto: CreatePetDto) {
    return this.prisma.pet.create({
      data: {
        ...dto,
        ownerId,
      },
    });
  }

  async update(id: string, ownerId: string, dto: UpdatePetDto) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.ownerId !== ownerId) {
      throw new ForbiddenException('Not authorized to update this pet');
    }

    return this.prisma.pet.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, ownerId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.ownerId !== ownerId) {
      throw new ForbiddenException('Not authorized to delete this pet');
    }

    return this.prisma.pet.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
