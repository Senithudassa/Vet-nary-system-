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

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'clinic-uuid' })
  @IsNotEmpty()
  @IsString()
  clinicId: string;

  @ApiProperty({ example: 'medical-record-uuid', required: false })
  @IsOptional()
  @IsString()
  medicalRecordId?: string;

  @ApiProperty({ example: 'appointment-uuid', required: false })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ example: 'Amoxicillin' })
  @IsNotEmpty()
  @IsString()
  medicineName: string;

  @ApiProperty({ example: '500mg', required: false })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiProperty({ example: 'Twice a day', required: false })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiProperty({ example: '7 days', required: false })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ example: 'Take after meals', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
