import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @ApiPropertyOptional({ example: 'Bug report' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: 'I cannot see my pet list' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'clinic-uuid' })
  @IsOptional()
  @IsUUID()
  targetClinicId?: string;

  @ApiPropertyOptional({
    example: 'vet-uuid',
    description: 'Assign ticket to a vet',
  })
  @IsOptional()
  @IsUUID()
  assignedVetId?: string;

  @ApiPropertyOptional({
    example: 'admin-uuid',
    description: 'Assign ticket to an admin',
  })
  @IsOptional()
  @IsUUID()
  assignedAdminId?: string;
}

export class UpdateTicketDto {
  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Update ticket status',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    example: 'vet-uuid',
    description: 'Assign or reassign a vet',
  })
  @IsOptional()
  @IsUUID()
  assignedVetId?: string;

  @ApiPropertyOptional({
    example: 'admin-uuid',
    description: 'Assign or reassign an admin',
  })
  @IsOptional()
  @IsUUID()
  assignedAdminId?: string;
}
