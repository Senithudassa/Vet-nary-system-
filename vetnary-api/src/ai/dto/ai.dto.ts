import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({
    description: 'User message to the veterinary chat agent',
    example: 'My dog has been scratching a lot. What could it be?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
