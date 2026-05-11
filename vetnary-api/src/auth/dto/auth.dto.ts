import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class RegisterClinicDto {
  @ApiProperty({ example: 'uuid-of-doctor' })
  @IsNotEmpty()
  @IsString()
  ownerId: string;
  @ApiProperty({ example: 'Happy Paws Clinic' })
  @IsNotEmpty()
  @IsString()
  clinicName: string;

  @ApiProperty({ example: '123 Pet St, Animal City' })
  @IsNotEmpty()
  @IsString()
  clinicAddress: string;

  @ApiProperty({ example: '09:00 - 18:00', required: false })
  @IsOptional()
  @IsString()
  operatingHours?: string;
}

export class RegisterDoctorDto extends RegisterCustomerDto {
  @ApiProperty({ example: 'VET-12345' })
  @IsNotEmpty()
  @IsString()
  licenseNumber: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;
}
