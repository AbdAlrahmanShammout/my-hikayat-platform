import { ApiProperty } from '@nestjs/swagger';

import { AuditLogPage } from '@/modules/audit/defs/audit-log-repository.defs';
import { AuditLogResponse } from '@/modules/audit/dto/response/model/audit-log.response';

export class GetAuditLogsResponseDto {
  @ApiProperty({ type: () => [AuditLogResponse] })
  auditLogs: AuditLogResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: AuditLogPage) {
    this.auditLogs = page.entities.map((entity) => new AuditLogResponse(entity));
    this.total = page.total;
  }
}
