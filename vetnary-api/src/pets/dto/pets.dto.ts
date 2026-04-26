import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePetDto {
  @ApiProperty({ example: 'Buddy' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dog' })
  @IsNotEmpty()
  @IsString()
  species: string;

  @ApiProperty({ example: 'Golden Retriever', required: false })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({ example: 15.5, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: '900123456789', required: false })
  @IsOptional()
  @IsString()
  microchip?: string;
}

export class UpdatePetDto {
  @ApiProperty({ example: 'Buddy', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Dog', required: false })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiProperty({ example: 'Golden Retriever', required: false })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({ example: 16.2, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: '900123456789', required: false })
  @IsOptional()
  @IsString()
  microchip?: string;
}
