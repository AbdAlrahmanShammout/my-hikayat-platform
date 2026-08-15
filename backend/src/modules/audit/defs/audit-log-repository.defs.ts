import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';

export type CreateAuditLogRepoInput = {
  readonly actorUserId: number;
  readonly action: AuditAction;
  readonly subjectType: AuditSubjectType;
  readonly subjectId: number;
  readonly reason?: string | null;
  readonly metadata?: unknown;
};

export type ListAuditLogsRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly actorUserId?: number;
  readonly action?: AuditAction;
  readonly subjectType?: AuditSubjectType;
  readonly subjectId?: number;
};

export type AuditLogPage = {
  readonly entities: AuditLogEntity[];
  readonly total: number;
};
