import { Test, TestingModule } from '@nestjs/testing';

import { AuditLogRepository } from '@/modules/audit/repository/audit-log.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AuditLogService } from './audit-log.service';
import { AuditModule } from './audit.module';

describe('AuditModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AuditModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        auditLog: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(AuditLogService)).toBeDefined();
    expect(moduleRef.get(AuditLogRepository)).toBeDefined();
    await moduleRef.close();
  });
});
