import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

export type AppendAuditLogServiceInput = {
  readonly actorUserId: number;
  readonly action: AuditAction;
  readonly subjectType: AuditSubjectType;
  readonly subjectId: number;
  readonly reason?: string | null;
  readonly metadata?: unknown;
};

export type ListAuditLogsServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly actorUserId?: number;
  readonly action?: AuditAction;
  readonly subjectType?: AuditSubjectType;
  readonly subjectId?: number;
};
