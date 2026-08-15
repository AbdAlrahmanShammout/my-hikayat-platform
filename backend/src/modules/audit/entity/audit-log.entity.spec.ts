import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

import { AuditLogEntity } from './audit-log.entity';

describe('AuditLogEntity', () => {
  it('holds actor, action, and subject identity', () => {
    const actualEntity = new AuditLogEntity({
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
    expect(actualEntity.actorUserId).toBe(9);
    expect(actualEntity.action).toBe(AuditAction.BOOK_APPROVED);
    expect(actualEntity.subjectType).toBe(AuditSubjectType.BOOK);
    expect(actualEntity.subjectId).toBe(8);
  });
});
