import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterClinicDto,
  RegisterCustomerDto,
  RefreshTokenDto,
  RegisterDoctorDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register/customer')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('register/doctor')
  @ApiOperation({ summary: 'Register a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor registered successfully' })
  registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.authService.registerDoctor(dto);
  }

  @Post('register/clinic')
  @ApiOperation({ summary: 'Register a new clinic' })
  @ApiResponse({ status: 201, description: 'Clinic registered successfully' })
  registerClinic(@Body() dto: RegisterClinicDto) {
    return this.authService.registerClinic(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/clinic')
  @ApiOperation({ summary: 'Login for clinic owners' })
  @ApiResponse({ status: 200, description: 'Clinic login successful' })
  loginClinic(@Body() dto: LoginDto) {
    return this.authService.loginClinic(dto);
  }

  @Post('login/admin')
  @ApiOperation({ summary: 'Login for admins' })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client-side token removal)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Post('doctor/upload-certificate')
  @UseInterceptors(FileInterceptor('certificate', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['certificate'],
      properties: {
        certificate: {
          type: 'string',
          format: 'binary',
          description: 'Doctor licence certificate image (JPEG, PNG, WEBP)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a doctor licence certificate image',
    description:
      'Accepts a certificate image via multipart/form-data (field name: "certificate") and stores it in Cloudinary under the vetnary-doctor-certificates folder. Returns the public URL and Cloudinary public ID.',
  })
  @ApiResponse({
    status: 201,
    description: 'Certificate uploaded successfully',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/vetnary-doctor-certificates/1234567890-licence.jpg',
        publicId: 'vetnary-doctor-certificates/1234567890-licence',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No certificate file provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadDoctorCertificate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'No certificate file provided. Send an image in the "certificate" form-data field.',
      );
    }

    const result = await this.cloudinaryService.uploadDoctorCertificate(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return result;
  }
}
