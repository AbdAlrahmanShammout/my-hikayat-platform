import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';

import { AuditLogResponse } from './audit-log.response';

describe('AuditLogResponse', () => {
  it('projects an audit entity without leaking persistence internals', () => {
    const entity = new AuditLogEntity({
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
    const actualResponse = new AuditLogResponse(entity);
    expect(actualResponse.id).toBe(3);
    expect(actualResponse.actorUserId).toBe(9);
    expect(actualResponse.action).toBe(AuditAction.BOOK_APPROVED);
    expect(actualResponse.subjectId).toBe(8);
    expect(actualResponse.metadata).toEqual({ from: 'in_review', to: 'approved' });
  });
});
