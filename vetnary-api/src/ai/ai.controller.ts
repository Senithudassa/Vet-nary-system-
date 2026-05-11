import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/scan-skin
   * Accepts an image file via multipart/form-data, then returns a
   * veterinary skin-condition diagnosis together with the detected disease
   * region's bounding box and the full image dimensions.
   */
  @Post('scan-skin')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Pet skin image file (JPEG, PNG, WEBP, HEIC, HEIF)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Analyze a pet skin image for disease detection',
    description:
      'Upload an image file via multipart/form-data (field name: "image"). Returns the detected skin condition, confidence, clinical recommendation, the bounding box of the affected area (as fractions of image dimensions), and the actual pixel dimensions of the image.',
  })
  @ApiResponse({
    status: 201,
    description: 'Skin analysis completed successfully',
    schema: {
      example: {
        condition: 'Ringworm (Dermatophytosis)',
        confidence: 87,
        recommendation:
          'Apply antifungal cream twice daily and consult a vet within 48 hours.',
        affectedArea: { x: 0.3, y: 0.25, width: 0.4, height: 0.35 },
        imageDimensions: { width: 1280, height: 960 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No image file provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'AI analysis failed' })
  scanSkin(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'No image file provided. Send a file in the "image" form-data field.',
      );
    }
    return this.aiService.analyzeSkin(file.buffer, file.mimetype);
  }

  /**
   * POST /ai/chat
   * Veterinary-only chat agent. Politely refuses non-vet questions.
   */
  @Post('chat')
  @ApiOperation({
    summary: 'Chat with the veterinary AI assistant',
    description:
      'Ask any veterinary or pet-health related question. The agent will refuse off-topic queries and always recommend consulting a licensed vet for serious issues.',
  })
  @ApiResponse({
    status: 201,
    description: 'Chat response generated successfully',
    schema: {
      example: {
        reply:
          'Excessive scratching in dogs can be caused by allergies (food or environmental), fleas, or dry skin. I recommend checking for visible parasites and consulting your vet if the scratching persists.',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Chat generation failed' })
  chat(@Body() dto: ChatMessageDto) {
    return this.aiService.chat(dto.message);
  }
}
