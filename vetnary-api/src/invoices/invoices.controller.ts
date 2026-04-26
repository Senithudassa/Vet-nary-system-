import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/invoices.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from "@prisma/client";

@ApiTags('Invoicing & Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('invoices')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Generate a new invoice (Vet only)' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  create(@Request() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.id, dto);
  }

  @Get('clinics/:clinicId/invoices')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'List clinic invoices (Vet only)' })
  @ApiResponse({ status: 200, description: 'Clinic invoices retrieved successfully' })
  findClinicInvoices(@Param('clinicId') clinicId: string, @Request() req: any) {
    return this.invoicesService.findClinicInvoices(clinicId, req.user.id);
  }

  @Get('invoices/me')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'List customer billing history' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  findMe(@Request() req: any) {
    return this.invoicesService.findMe(req.user.id);
  }

  @Patch('invoices/:id/pay')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Mark an invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
  pay(@Param('id') id: string, @Request() req: any) {
    return this.invoicesService.pay(id, req.user.id, req.user.role);
  }
}
