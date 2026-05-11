import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { PetsService } from './pets.service';
import { CreatePetDto, UpdatePetDto } from './dto/pets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Pet Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'List all pets belonging to the customer' })
  @ApiResponse({ status: 200, description: 'Pets retrieved successfully' })
  findAll(@Request() req: any) {
    return this.petsService.findAll(req.user.id);
  }

  @Get('vet')
  @Roles(Role.VET)
  @ApiOperation({ summary: 'List all pets associated with the vet' })
  @ApiResponse({ status: 200, description: 'Pets retrieved successfully' })
  findAllForVet(@Request() req: any) {
    return this.petsService.findAllForVet(req.user.id);
  }

  @Post()
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Add a new pet' })
  @ApiResponse({ status: 201, description: 'Pet created successfully' })
  create(@Request() req: any, @Body() dto: CreatePetDto) {
    return this.petsService.create(req.user.id, dto);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.VET)
  @ApiOperation({ summary: 'Get pet details' })
  @ApiResponse({
    status: 200,
    description: 'Pet details retrieved successfully',
  })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.petsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Update pet details' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully' })
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdatePetDto,
  ) {
    return this.petsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Soft-delete a pet' })
  @ApiResponse({ status: 200, description: 'Pet deleted successfully' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.petsService.remove(id, req.user.id);
  }

  @Patch(':id/verify')
  @Roles(Role.VET, Role.MAIN_ADMIN, Role.MINOR_ADMIN)
  @ApiOperation({ summary: 'Verify a pet' })
  @ApiResponse({ status: 200, description: 'Pet verified successfully' })
  verify(@Param('id') id: string) {
    return this.petsService.verify(id);
  }
}
