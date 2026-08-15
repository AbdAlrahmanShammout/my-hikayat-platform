import { AuditLogPrismaRepository } from '@/modules/audit/repository/audit-log-prisma.repository';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

describe('AuditLogPrismaRepository', () => {
  it('creates an append-only row and maps it to an entity', async () => {
    const createdAt = new Date('2026-08-15T00:00:00.000Z');
    const mockPrismaProviderService = {
      auditLog: {
        create: jest.fn().mockResolvedValue({
          id: 3,
          createdAt,
          updatedAt: createdAt,
          deletedAt: null,
          actorUserId: 9,
          action: AuditAction.BOOK_APPROVED,
          subjectType: AuditSubjectType.BOOK,
          subjectId: 8,
          reason: null,
          metadata: { from: 'in_review', to: 'approved' },
        }),
      },
    };
    const auditLogPrismaRepository = new AuditLogPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
    const actualEntity = await auditLogPrismaRepository.create({
      actorUserId: 9,
      action: AuditAction.BOOK_APPROVED,
      subjectType: AuditSubjectType.BOOK,
      subjectId: 8,
      metadata: { from: 'in_review', to: 'approved' },
    });
    expect(mockPrismaProviderService.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorUserId: 9,
        action: AuditAction.BOOK_APPROVED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: 8,
        reason: null,
        metadata: { from: 'in_review', to: 'approved' },
      },
    });
    expect(actualEntity.id).toBe(3);
    expect(actualEntity.action).toBe(AuditAction.BOOK_APPROVED);
  });
});
