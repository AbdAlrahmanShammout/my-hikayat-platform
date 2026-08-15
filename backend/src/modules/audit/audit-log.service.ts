import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogPage } from '@/modules/audit/defs/audit-log-repository.defs';
import {
  AppendAuditLogServiceInput,
  ListAuditLogsServiceInput,
} from '@/modules/audit/defs/audit-log-service.defs';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';
import { AuditLogRepository } from '@/modules/audit/repository/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async append(
    input: AppendAuditLogServiceInput,
    context?: TransactionContext,
  ): Promise<AuditLogEntity> {
    return this.auditLogRepository.create(
      {
        actorUserId: input.actorUserId,
        action: input.action,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        reason: input.reason,
        metadata: input.metadata,
      },
      context,
    );
  }

  async listAuditLogs(input: ListAuditLogsServiceInput = {}): Promise<AuditLogPage> {
    return this.auditLogRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      actorUserId: input.actorUserId,
      action: input.action,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
    });
  }

  async findAuditLogById(id: number): Promise<AuditLogEntity | null> {
    return this.auditLogRepository.findById(id);
  }

  async getAuditLogById(id: number): Promise<AuditLogEntity> {
    const auditLog: AuditLogEntity | null = await this.findAuditLogById(id);
    if (auditLog === null) {
      throw new ResourceNotFoundException('Audit log', id);
    }
    return auditLog;
  }
}
