import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserFilterDto, UpdateUserRoleDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from "@prisma/client";

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.MAIN_ADMIN)
  @ApiOperation({ summary: 'List all users (Main Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(@Query() filter: UserFilterDto) {
    return this.usersService.findAll(filter);
  }

  @Patch(':id/role')
  @Roles(Role.MAIN_ADMIN)
  @ApiOperation({ summary: 'Update user role (Main Admin only)' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto);
  }
}
