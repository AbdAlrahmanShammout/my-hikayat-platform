import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AuditLogType } from '@/modules/audit/types/audit-log-details-schema.type';
import { UserMapper } from '@/modules/user/mapper/user.mapper';

export class AuditLogMapper {
  static toEntity(schema: AuditLogType): AuditLogEntity {
    return new AuditLogEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      actorUserId: schema.actorUserId,
      action: schema.action as AuditAction,
      subjectType: schema.subjectType as AuditSubjectType,
      subjectId: schema.subjectId,
      reason: schema.reason,
      metadata: schema.metadata,
      actor: schema.actor === undefined ? undefined : UserMapper.toEntity(schema.actor),
    });
  }
}
