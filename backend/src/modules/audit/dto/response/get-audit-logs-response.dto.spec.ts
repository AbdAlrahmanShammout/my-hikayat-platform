import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';

import { GetAuditLogsResponseDto } from './get-audit-logs-response.dto';

describe('GetAuditLogsResponseDto', () => {
  it('maps a page of audit entities onto the list envelope', () => {
    const entity = new AuditLogEntity({
      id: 3,
      createdAt: new Date('2026-08-15T00:00:00.000Z'),
      updatedAt: new Date('2026-08-15T00:00:00.000Z'),
      actorUserId: 9,
      action: AuditAction.BOOK_APPROVED,
      subjectType: AuditSubjectType.BOOK,
      subjectId: 8,
      reason: null,
      metadata: null,
    });
    const actualResponse = new GetAuditLogsResponseDto({ entities: [entity], total: 1 });
    expect(actualResponse.total).toBe(1);
    expect(actualResponse.auditLogs[0].id).toBe(3);
  });
});
