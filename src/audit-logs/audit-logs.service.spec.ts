import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsRepository } from './audit-logs.repository';
import { AuditLogExportJobRepository } from './repositories/audit-log-export-job.repository';
import { AuditLogScheduleRepository } from './repositories/audit-log-schedule.repository';
import { AuditEntityType } from './enums/audit-entity-type.enum';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let repository: AuditLogsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: AuditLogsRepository,
          useValue: {
            createAuditLog: jest.fn(),
            findLogsWithPagination: jest.fn(),
          },
        },
        {
          provide: AuditLogExportJobRepository,
          useValue: {
            createJob: jest.fn(),
            updateJobStatus: jest.fn(),
            getJob: jest.fn(),
          },
        },
        {
          provide: AuditLogScheduleRepository,
          useValue: {
            createSchedule: jest.fn(),
            getDueSchedules: jest.fn(),
            updateLastRun: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    repository = module.get<AuditLogsRepository>(AuditLogsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create an audit log', async () => {
      const createDto = {
        userId: 'user-123',
        action: 'TEST_ACTION',
        entity: AuditEntityType.SYSTEM,
        ipAddress: '127.0.0.1',
      };

      const mockLog = { id: 'log-123', ...createDto };
      jest
        .spyOn(repository, 'createAuditLog')
        .mockResolvedValue(mockLog as any);

      await service.createLog(createDto);

      expect(repository.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining(createDto),
      );
    });
  });
});
