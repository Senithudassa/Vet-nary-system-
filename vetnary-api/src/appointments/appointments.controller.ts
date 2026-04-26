import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto, AddToQueueDto } from './dto/appointments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from "@prisma/client";

@ApiTags('Appointments & Queue Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('appointments')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Book a new appointment (Customer only)' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  create(@Request() req: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.id, dto);
  }

  @Get('appointments/me')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'List customer appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  findMe(@Request() req: any) {
    return this.appointmentsService.findMe(req.user.id);
  }

  @Get('clinics/:clinicId/appointments')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'List clinic appointments (Vet only)' })
  @ApiResponse({ status: 200, description: 'Clinic appointments retrieved successfully' })
  findClinicAppointments(@Param('clinicId') clinicId: string, @Request() req: any) {
    return this.appointmentsService.findClinicAppointments(clinicId, req.user.id);
  }

  @Patch('appointments/:id/status')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, req.user.id, req.user.role, dto);
  }

  @Get('clinics/:clinicId/queue')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Get current daily queue for clinic (Vet only)' })
  @ApiResponse({ status: 200, description: 'Queue retrieved successfully' })
  getQueue(@Param('clinicId') clinicId: string, @Request() req: any) {
    return this.appointmentsService.getQueue(clinicId, req.user.id);
  }

  @Post('clinics/:clinicId/queue')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Add arrived patient to live queue (Vet only)' })
  @ApiResponse({ status: 201, description: 'Added to queue successfully' })
  addToQueue(@Param('clinicId') clinicId: string, @Request() req: any, @Body() dto: AddToQueueDto) {
    return this.appointmentsService.addToQueue(clinicId, req.user.id, dto);
  }
}
