import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import {
  UpdateClinicStatusDto,
  UpdateClinicDto,
  AddStaffDto,
} from './dto/clinics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Clinic Operations')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  @ApiOperation({ summary: 'List all approved clinics (Public)' })
  @ApiResponse({ status: 200, description: 'Clinics retrieved successfully' })
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MAIN_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all clinics (Main Admin only)' })
  @ApiResponse({ status: 200, description: 'Clinics retrieved successfully' })
  findAllForAdmin() {
    return this.clinicsService.findAllForAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clinic details (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Clinic details retrieved successfully',
  })
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MAIN_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a clinic (Main Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateClinicStatusDto) {
    return this.clinicsService.updateStatus(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VET, Role.MAIN_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update clinic details (Vet or Main Admin only)' })
  @ApiResponse({ status: 200, description: 'Clinic updated successfully' })
  updateClinic(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateClinicDto,
  ) {
    return this.clinicsService.updateClinic(
      id,
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Get(':id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List clinic staff (Vet only)' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  getStaff(@Param('id') id: string) {
    return this.clinicsService.getStaff(id);
  }

  @Post(':id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add staff to clinic (Vet only)' })
  @ApiResponse({ status: 201, description: 'Staff added successfully' })
  addStaff(@Param('id') id: string, @Body() dto: AddStaffDto) {
    return this.clinicsService.addStaff(id, dto);
  }
}
