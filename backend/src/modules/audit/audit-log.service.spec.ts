import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';

import { AuditLogService } from './audit-log.service';

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

describe('AuditLogService', () => {
  let mockAuditLogRepository: { create: jest.Mock; findById: jest.Mock; list: jest.Mock };
  let auditLogService: AuditLogService;

  beforeEach(() => {
    mockAuditLogRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };
    auditLogService = new AuditLogService(mockAuditLogRepository);
  });

  describe('append', () => {
    it('persists an append-only audit entry', async () => {
      const expectedAuditLog = createSampleAuditLog();
      mockAuditLogRepository.create.mockResolvedValue(expectedAuditLog);
      const actualAuditLog = await auditLogService.append({
        actorUserId: 9,
        action: AuditAction.BOOK_APPROVED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: 8,
        metadata: { from: 'in_review', to: 'approved' },
      });
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.BOOK_APPROVED,
          subjectType: AuditSubjectType.BOOK,
          subjectId: 8,
          reason: undefined,
          metadata: { from: 'in_review', to: 'approved' },
        },
        undefined,
      );
      expect(actualAuditLog).toBe(expectedAuditLog);
    });
  });

  describe('listAuditLogs', () => {
    it('lists newest entries first with default pagination', async () => {
      const expectedPage = { entities: [createSampleAuditLog()], total: 1 };
      mockAuditLogRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await auditLogService.listAuditLogs({
        action: AuditAction.BOOK_APPROVED,
      });
      expect(mockAuditLogRepository.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        actorUserId: undefined,
        action: AuditAction.BOOK_APPROVED,
        subjectType: undefined,
        subjectId: undefined,
      });
      expect(actualPage).toBe(expectedPage);
    });
  });

  describe('getAuditLogById', () => {
    it('returns the entry when it exists', async () => {
      const expectedAuditLog = createSampleAuditLog();
      mockAuditLogRepository.findById.mockResolvedValue(expectedAuditLog);
      await expect(auditLogService.getAuditLogById(3)).resolves.toBe(expectedAuditLog);
    });

    it('throws when the entry is missing', async () => {
      mockAuditLogRepository.findById.mockResolvedValue(null);
      await expect(auditLogService.getAuditLogById(99)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
