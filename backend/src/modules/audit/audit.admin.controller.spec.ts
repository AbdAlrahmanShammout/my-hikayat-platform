import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';

import { AuditAdminController } from './audit.admin.controller';

function createSampleAuditLog(): AuditLogEntity {
  return new AuditLogEntity({
    id: 3,
    createdAt: new Date('2026-08-15T00:00:00.000Z'),
    updatedAt: new Date('2026-08-15T00:00:00.000Z'),
    actorUserId: 9,
    action: AuditAction.BOOK_APPROVED,
    subjectType: AuditSubjectType.BOOK,
    subjectId: 8,
    reason: null,
    metadata: { from: 'in_review', to: 'approved' },
  });
}

describe('AuditAdminController', () => {
  let auditAdminController: AuditAdminController;
  let mockAuditLogService: { listAuditLogs: jest.Mock; getAuditLogById: jest.Mock };

  beforeEach(async () => {
    mockAuditLogService = { listAuditLogs: jest.fn(), getAuditLogById: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuditAdminController],
      providers: [
        { provide: AuditLogService, useValue: mockAuditLogService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    auditAdminController = moduleRef.get(AuditAdminController);
  });

  describe('listAuditLogs', () => {
    it('forwards filters into the list envelope', async () => {
      const expectedAuditLog = createSampleAuditLog();
      mockAuditLogService.listAuditLogs.mockResolvedValue({
        entities: [expectedAuditLog],
        total: 1,
      });
      const actualResponse = await auditAdminController.listAuditLogs({
        limit: 10,
        offset: 0,
        action: AuditAction.BOOK_APPROVED,
      });
      expect(mockAuditLogService.listAuditLogs).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        actorUserId: undefined,
        action: AuditAction.BOOK_APPROVED,
        subjectType: undefined,
        subjectId: undefined,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.auditLogs[0].id).toBe(3);
    });
  });

  describe('getAuditLog', () => {
    it('returns the requested audit entry', async () => {
      mockAuditLogService.getAuditLogById.mockResolvedValue(createSampleAuditLog());
      const actualResponse = await auditAdminController.getAuditLog(3);
      expect(mockAuditLogService.getAuditLogById).toHaveBeenCalledWith(3);
      expect(actualResponse.action).toBe(AuditAction.BOOK_APPROVED);
    });
  });
});
