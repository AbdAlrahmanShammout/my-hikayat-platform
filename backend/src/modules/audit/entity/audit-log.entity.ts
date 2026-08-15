import { BaseEntity } from '@/common/base/base.entity';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogZodType } from '@/modules/audit/zod/audit-log.zod';

export class AuditLogEntity extends BaseEntity {
  actorUserId!: number;
  action!: AuditAction;
  subjectType!: AuditSubjectType;
  subjectId!: number;
  reason!: string | null;
  metadata!: unknown;

  constructor(data: AuditLogZodType) {
    super();
    Object.assign(this, data);
  }
}
