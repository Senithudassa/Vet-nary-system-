import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VetbookService } from './vetbook.service';
import { CreateMedicalRecordDto, CreateVaccinationDto } from './dto/vetbook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from "@prisma/client";

@ApiTags('VetBook & Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class VetbookController {
  constructor(private readonly vetbookService: VetbookService) {}

  @Get('vetbook/:petId')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Get merged medical timeline for a pet' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
  getPetTimeline(@Param('petId') petId: string, @Request() req: any) {
    return this.vetbookService.getPetTimeline(petId, req.user.id, req.user.role);
  }

  @Post('vetbook/:petId/medical')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Add a new medical record (Vet only)' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  createMedicalRecord(@Param('petId') petId: string, @Request() req: any, @Body() dto: CreateMedicalRecordDto) {
    return this.vetbookService.createMedicalRecord(petId, req.user.id, dto);
  }

  @Post('vetbook/:petId/vaccine')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Add a new vaccination record (Vet only)' })
  @ApiResponse({ status: 201, description: 'Vaccination record created successfully' })
  createVaccination(@Param('petId') petId: string, @Request() req: any, @Body() dto: CreateVaccinationDto) {
    return this.vetbookService.createVaccination(petId, req.user.id, dto);
  }

  @Get('clinics/:clinicId/records')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'List all historical records for a clinic (Vet only)' })
  @ApiResponse({ status: 200, description: 'Clinic records retrieved successfully' })
  getClinicRecords(@Param('clinicId') clinicId: string, @Request() req: any) {
    return this.vetbookService.getClinicRecords(clinicId, req.user.id);
  }
}
