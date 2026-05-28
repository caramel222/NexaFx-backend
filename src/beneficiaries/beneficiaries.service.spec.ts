import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary } from './entities/beneficiary.entity';

describe('BeneficiariesService', () => {
  let service: BeneficiariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficiariesService,
        {
          provide: getRepositoryToken(Beneficiary),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BeneficiariesService>(BeneficiariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
