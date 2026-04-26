import { Module } from '@nestjs/common';
import { VetbookService } from './vetbook.service';
import { VetbookController } from './vetbook.controller';

@Module({
  providers: [VetbookService],
  controllers: [VetbookController]
})
export class VetbookModule {}
