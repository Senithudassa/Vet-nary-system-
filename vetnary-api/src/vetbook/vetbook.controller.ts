import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VetbookService } from './vetbook.service';
import {
  CreateMedicalRecordDto,
  CreateVaccinationDto,
  CreatePrescriptionDto,
} from './dto/vetbook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

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
    return this.vetbookService.getPetTimeline(
      petId,
      req.user.id,
      req.user.role,
    );
  }

  @Post('vetbook/:petId/medical')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Add a new medical record (Vet only)' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  createMedicalRecord(
    @Param('petId') petId: string,
    @Request() req: any,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.vetbookService.createMedicalRecord(petId, req.user.id, dto);
  }

  @Post('vetbook/:petId/vaccine')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Add a new vaccination record (Vet only)' })
  @ApiResponse({
    status: 201,
    description: 'Vaccination record created successfully',
  })
  createVaccination(
    @Param('petId') petId: string,
    @Request() req: any,
    @Body() dto: CreateVaccinationDto,
  ) {
    return this.vetbookService.createVaccination(petId, req.user.id, dto);
  }

  @Get('clinics/:clinicId/records')
  @Roles(Role.VET)
  @ApiOperation({
    summary: 'List all historical records for a clinic (Vet only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic records retrieved successfully',
  })
  getClinicRecords(@Param('clinicId') clinicId: string, @Request() req: any) {
    return this.vetbookService.getClinicRecords(clinicId, req.user.id);
  }

  @Post('vetbook/:petId/prescription')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Add a new prescription (Vet only)' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  createPrescription(
    @Param('petId') petId: string,
    @Request() req: any,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.vetbookService.createPrescription(petId, req.user.id, dto);
  }

  @Delete('vetbook/prescription/:id')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Delete a prescription (Vet only)' })
  @ApiResponse({ status: 200, description: 'Prescription deleted successfully' })
  deletePrescription(@Param('id') id: string, @Request() req: any) {
    return this.vetbookService.deletePrescription(id, req.user.id, req.user.role);
  }

  @Get('vetbook/:petId/prescriptions')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Get all prescriptions for a pet' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  getPetPrescriptions(@Param('petId') petId: string) {
    return this.vetbookService.getPetPrescriptions(petId);
  }

  @Get('clinics/:clinicId/prescriptions')
  @Roles(Role.VET, Role.MAIN_ADMIN)
  @ApiOperation({ summary: 'Get all prescriptions for a clinic' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  getClinicPrescriptions(@Param('clinicId') clinicId: string) {
    return this.vetbookService.getClinicPrescriptions(clinicId);
  }

  @Get('appointments/:appointmentId/prescriptions')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Get all prescriptions for an appointment' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  getAppointmentPrescriptions(@Param('appointmentId') appointmentId: string) {
    return this.vetbookService.getAppointmentPrescriptions(appointmentId);
  }
}
