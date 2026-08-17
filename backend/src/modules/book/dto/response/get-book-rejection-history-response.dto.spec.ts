import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

import { GetBookRejectionHistoryResponseDto } from './get-book-rejection-history-response.dto';

describe('GetBookRejectionHistoryResponseDto', () => {
  it('maps a page of book_rejected audit entities onto the history envelope', () => {
    const entity = new AuditLogEntity({
      id: 12,
      createdAt: new Date('2026-08-15T00:00:00.000Z'),
      updatedAt: new Date('2026-08-15T00:00:00.000Z'),
      actorUserId: 9,
      action: AuditAction.BOOK_REJECTED,
      subjectType: AuditSubjectType.BOOK,
      subjectId: 8,
      reason: 'Cover art is unreadable at catalog size.',
      metadata: { from: 'in_review', to: 'rejected' },
    });
    const actualResponse = new GetBookRejectionHistoryResponseDto({
      entities: [entity],
      total: 1,
    });
    expect(actualResponse.total).toBe(1);
    expect(actualResponse.rejections).toHaveLength(1);
    expect(actualResponse.rejections[0].id).toBe(12);
    expect(actualResponse.rejections[0].action).toBe(AuditAction.BOOK_REJECTED);
    expect(actualResponse.rejections[0].reason).toBe('Cover art is unreadable at catalog size.');
  });
});
