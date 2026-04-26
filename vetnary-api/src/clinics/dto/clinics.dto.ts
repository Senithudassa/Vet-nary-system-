import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClinicStatus } from "@prisma/client";

export class UpdateClinicStatusDto {
  @ApiProperty({ enum: ClinicStatus })
  @IsEnum(ClinicStatus)
  status: ClinicStatus;
}

export class UpdateClinicDto {
  @ApiProperty({ example: 'Happy Paws Clinic', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '123 Pet St, Animal City', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -74.006, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '09:00 - 18:00', required: false })
  @IsOptional()
  @IsString()
  operatingHours?: string;
}

export class AddStaffDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
