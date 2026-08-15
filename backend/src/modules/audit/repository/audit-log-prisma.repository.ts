import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  AuditLogPage,
  CreateAuditLogRepoInput,
  ListAuditLogsRepoInput,
} from '@/modules/audit/defs/audit-log-repository.defs';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';
import { AuditLogMapper } from '@/modules/audit/mapper/audit-log.mapper';
import { AuditLogRepository } from '@/modules/audit/repository/audit-log.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class AuditLogPrismaRepository implements AuditLogRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateAuditLogRepoInput,
    context?: TransactionContext,
  ): Promise<AuditLogEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        reason: input.reason ?? null,
        ...(input.metadata === undefined
          ? {}
          : { metadata: input.metadata as Prisma.InputJsonValue }),
      },
    });
    return AuditLogMapper.toEntity(result);
  }

  async findById(id: number): Promise<AuditLogEntity | null> {
    const result = await this.prismaProviderService.auditLog.findFirst({
      where: { id },
    });
    if (result === null) {
      return null;
    }
    return AuditLogMapper.toEntity(result);
  }

  async list(input: ListAuditLogsRepoInput): Promise<AuditLogPage> {
    const where: Prisma.AuditLogWhereInput = {};
    if (input.actorUserId !== undefined) {
      where.actorUserId = input.actorUserId;
    }
    if (input.action !== undefined) {
      where.action = input.action;
    }
    if (input.subjectType !== undefined) {
      where.subjectType = input.subjectType;
    }
    if (input.subjectId !== undefined) {
      where.subjectId = input.subjectId;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.auditLog.count({ where }),
    ]);
    return {
      entities: rows.map((row) => AuditLogMapper.toEntity(row)),
      total,
    };
  }
}
