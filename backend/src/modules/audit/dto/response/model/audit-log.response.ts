import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

export class AuditLogResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'User who performed the action', example: 9 })
  actorUserId: number;

  @ApiProperty({
    description: 'Recorded admin or publishing action',
    enum: AuditAction,
    example: AuditAction.BOOK_APPROVED,
  })
  action: AuditAction;

  @ApiProperty({
    description: 'Kind of subject the action targeted',
    enum: AuditSubjectType,
    example: AuditSubjectType.BOOK,
  })
  subjectType: AuditSubjectType;

  @ApiProperty({ description: 'Identifier of the targeted subject', example: 8 })
  subjectId: number;

  @ApiPropertyOptional({
    description: 'Optional human-readable reason',
    example: 'Cover art does not meet catalog standards',
    nullable: true,
  })
  reason: string | null;

  @ApiPropertyOptional({
    description: 'Structured details such as previous and next status',
    nullable: true,
  })
  metadata: unknown;

  constructor(entity: AuditLogEntity) {
    super(entity);
    this.actorUserId = entity.actorUserId;
    this.action = entity.action;
    this.subjectType = entity.subjectType;
    this.subjectId = entity.subjectId;
    this.reason = entity.reason;
    this.metadata = entity.metadata;
  }
}
