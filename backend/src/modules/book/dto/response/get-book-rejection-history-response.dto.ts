import { ApiProperty } from '@nestjs/swagger';

import { AuditLogPage } from '@/modules/audit/defs/audit-log-repository.defs';
import { AuditLogResponse } from '@/modules/audit/dto/response/model/audit-log.response';

export class GetBookRejectionHistoryResponseDto {
  @ApiProperty({ type: () => [AuditLogResponse] })
  rejections: AuditLogResponse[];

  @ApiProperty({
    description: 'Total book_rejected audit rows for this book, across all pages',
    example: 2,
  })
  total: number;

  constructor(page: AuditLogPage) {
    this.rejections = page.entities.map((entity) => new AuditLogResponse(entity));
    this.total = page.total;
  }
}
