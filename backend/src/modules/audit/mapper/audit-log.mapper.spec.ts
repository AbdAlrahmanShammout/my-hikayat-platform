import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogType } from '@/modules/audit/types/audit-log-details-schema.type';

import { AuditLogMapper } from './audit-log.mapper';

describe('AuditLogMapper', () => {
  it('maps a persistence payload onto an AuditLogEntity', () => {
    const createdAt = new Date('2026-08-15T00:00:00.000Z');
    const inputSchema: AuditLogType = {
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
    };
    const actualEntity = AuditLogMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(3);
    expect(actualEntity.action).toBe(AuditAction.BOOK_APPROVED);
    expect(actualEntity.subjectId).toBe(8);
    expect(actualEntity.metadata).toEqual({ from: 'in_review', to: 'approved' });
  });
});
