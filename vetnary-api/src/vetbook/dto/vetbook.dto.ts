import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'clinic-uuid' })
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @ApiProperty({ example: 'Gastroenteritis' })
  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'Dietary restriction', required: false })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({ example: 'Probiotics', required: false })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({ example: 'Keep hydrated', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateVaccinationDto {
  @ApiProperty({ example: 'clinic-uuid' })
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @ApiProperty({ example: 'Rabies' })
  @IsNotEmpty()
  @IsString()
  vaccineName: string;

  @ApiProperty({ example: 'BATCH12345' })
  @IsNotEmpty()
  @IsString()
  batchNumber: string;

  @ApiProperty({ example: '2027-04-26T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;
}
