import { Test, TestingModule } from '@nestjs/testing';
import { VetbookService } from './vetbook.service';

describe('VetbookService', () => {
  let service: VetbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VetbookService],
    }).compile();

    service = module.get<VetbookService>(VetbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
