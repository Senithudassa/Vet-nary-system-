import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterClinicDto,
  RegisterCustomerDto,
  RegisterDoctorDto,
} from './dto/auth.dto';
import { Role, ClinicStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.CUSTOMER,
      },
    });

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }

  async registerDoctor(dto: RegisterDoctorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        licenseCertificateUrl: dto.licenseCertificateUrl,
        role: Role.VET,
      },
    });

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }

  async registerClinic(dto: RegisterClinicDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: dto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException('Doctor not found');
    }
    if (owner.role !== Role.VET) {
      throw new ConflictException('Owner must be a doctor');
    }

    return this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: dto.clinicName,
          address: dto.clinicAddress,
          latitude: dto.latitude,
          longitude: dto.longitude,
          operatingHours: dto.operatingHours,
          status: ClinicStatus.PENDING,
          ownerId: owner.id,
        },
      });

      await tx.clinicStaff.create({
        data: {
          clinicId: clinic.id,
          userId: owner.id,
        },
      });

      return { message: 'Clinic registered successfully', clinic };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (
      !user ||
      !(await this.comparePassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      ...(user.role === Role.VET && {
        licenseCertificateUrl: user.licenseCertificateUrl,
      }),
    };
  }

  async loginClinic(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { ownedClinics: true },
    });

    if (
      !user ||
      !(await this.comparePassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.role !== Role.VET || user.ownedClinics.length === 0) {
      throw new UnauthorizedException('User is not a clinic owner');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async loginAdmin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (
      !user ||
      !(await this.comparePassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.role !== Role.MAIN_ADMIN && user.role !== Role.MINOR_ADMIN) {
      throw new UnauthorizedException('User is not an admin');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        staffProfiles: {
          select: {
            clinicId: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const { staffProfiles, ...userData } = user;
    if (user.role === Role.VET) {
      const clinicId = staffProfiles?.[0]?.clinicId ?? null;
      return {
        ...userData,
        clinicId,
      };
    }
    return userData;
  }
}
