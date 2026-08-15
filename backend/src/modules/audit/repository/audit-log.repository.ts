import { TransactionContext } from '@/common/base/transaction-context';
import {
  AuditLogPage,
  CreateAuditLogRepoInput,
  ListAuditLogsRepoInput,
} from '@/modules/audit/defs/audit-log-repository.defs';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';

export abstract class AuditLogRepository {
  abstract create(
    input: CreateAuditLogRepoInput,
    context?: TransactionContext,
  ): Promise<AuditLogEntity>;
  abstract findById(id: number): Promise<AuditLogEntity | null>;
  abstract list(input: ListAuditLogsRepoInput): Promise<AuditLogPage>;
}
