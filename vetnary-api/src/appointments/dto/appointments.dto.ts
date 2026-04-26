import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from "@prisma/client";

export class CreateAppointmentDto {
  @ApiProperty({ example: 'clinic-uuid' })
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @ApiProperty({ example: 'pet-uuid' })
  @IsNotEmpty()
  @IsString()
  petId: string;

  @ApiProperty({ example: '2026-04-26T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Regular checkup', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

export class AddToQueueDto {
  @ApiProperty({ example: 'pet-uuid' })
  @IsNotEmpty()
  @IsString()
  petId: string;

  @ApiProperty({ example: 'appointment-uuid', required: false })
  @IsOptional()
  @IsString()
  appointmentId?: string;
}
