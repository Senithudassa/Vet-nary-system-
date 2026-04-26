import { Test, TestingModule } from '@nestjs/testing';
import { VetbookController } from './vetbook.controller';

describe('VetbookController', () => {
  let controller: VetbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VetbookController],
    }).compile();

    controller = module.get<VetbookController>(VetbookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
