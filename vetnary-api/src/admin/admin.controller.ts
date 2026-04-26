import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from "@prisma/client";

@ApiTags('Support & Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('support-tickets')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Submit a new support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket submitted successfully' })
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.adminService.createTicket(req.user.id, dto);
  }

  @Get('support-tickets')
  @Roles(Role.MAIN_ADMIN, Role.MINOR_ADMIN)
  @ApiOperation({ summary: 'List all support tickets (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  findAllTickets() {
    return this.adminService.findAllTickets();
  }

  @Patch('support-tickets/:id')
  @Roles(Role.MINOR_ADMIN)
  @ApiOperation({ summary: 'Update ticket status (Minor Admin only)' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.adminService.updateTicket(id, dto);
  }

  @Get('admin/stats')
  @Roles(Role.MAIN_ADMIN)
  @ApiOperation({ summary: 'Get global platform statistics (Main Admin only)' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  getStats() {
    return this.adminService.getStats();
  }
}
