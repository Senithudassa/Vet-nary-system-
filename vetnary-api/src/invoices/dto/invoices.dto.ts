import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from "@prisma/client";

export class CreateInvoiceDto {
  @ApiProperty({ example: 'clinic-uuid' })
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @ApiProperty({ example: 'owner-uuid' })
  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @ApiProperty({ example: 'appointment-uuid', required: false })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ example: 75.0 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
