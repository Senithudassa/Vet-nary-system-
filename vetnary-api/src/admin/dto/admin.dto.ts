import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from "@prisma/client";

export class CreateTicketDto {
  @ApiProperty({ example: 'Bug report' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'I cannot see my pet list' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'clinic-uuid', required: false })
  @IsOptional()
  @IsString()
  targetClinicId?: string;
}

export class UpdateTicketDto {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
