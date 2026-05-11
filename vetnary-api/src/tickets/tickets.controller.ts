import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  EscalateTicketDto,
  UpdateTicketDto,
} from './dto/tickets.dto';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('support-tickets')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(req.user.id, req.user.role, dto);
  }

  @Get('support-tickets')
  @Roles(Role.MAIN_ADMIN, Role.MINOR_ADMIN)
  @ApiOperation({ summary: 'List all tickets (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  listAllTickets() {
    return this.ticketsService.listAllTickets();
  }

  @Get('support-tickets/me')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'List tickets created by the current user' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  listMyTickets(@Request() req: any) {
    return this.ticketsService.listMyTickets(req.user.id);
  }

  @Get('support-tickets/assigned')
  @Roles(Role.VET, Role.MAIN_ADMIN, Role.MINOR_ADMIN)
  @ApiOperation({ summary: 'List tickets assigned to current vet/admin' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  listAssignedTickets(@Request() req: any) {
    return this.ticketsService.listAssignedTickets(req.user.id, req.user.role);
  }

  @Patch('support-tickets/:id')
  @Roles(Role.VET, Role.MAIN_ADMIN, Role.MINOR_ADMIN)
  @ApiOperation({ summary: 'Update ticket status or assignment' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  updateTicket(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.updateTicket(
      id,
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Patch('support-tickets/:id/escalate')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'Escalate a ticket to an admin (Vet only)' })
  @ApiResponse({ status: 200, description: 'Ticket escalated successfully' })
  escalateTicket(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: EscalateTicketDto,
  ) {
    return this.ticketsService.escalateTicket(id, req.user.id, dto);
  }
}
