import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { AuditLogService } from './audit-log.service';
import { AuditLogPrismaRepository } from './repository/audit-log-prisma.repository';
import { AuditLogRepository } from './repository/audit-log.repository';

@Module({
  imports: [DatabaseProviderModule],
  providers: [AuditLogService, { provide: AuditLogRepository, useClass: AuditLogPrismaRepository }],
  exports: [AuditLogService],
})
export class AuditModule {}
