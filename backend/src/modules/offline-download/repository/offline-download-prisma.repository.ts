import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateOfflineDownloadRepoInput,
  FindOfflineDownloadRepoInput,
  RestoreOfflineDownloadRepoInput,
} from '@/modules/offline-download/defs/offline-download-repository.defs';
import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';
import { OfflineDownloadMapper } from '@/modules/offline-download/mapper/offline-download.mapper';
import { OfflineDownloadRepository } from '@/modules/offline-download/repository/offline-download.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class OfflineDownloadPrismaRepository implements OfflineDownloadRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async findByUserIdAndBookId(
    input: FindOfflineDownloadRepoInput,
    context?: TransactionContext,
  ): Promise<OfflineDownloadEntity | null> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.offlineDownload.findFirst({
      where: { userId: input.userId, bookId: input.bookId },
    });
    if (result === null) {
      return null;
    }
    return OfflineDownloadMapper.toEntity(result);
  }

  async countActiveByUserId(userId: number, context?: TransactionContext): Promise<number> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    return client.offlineDownload.count({
      where: { userId, deletedAt: null },
    });
  }

  async create(
    input: CreateOfflineDownloadRepoInput,
    context?: TransactionContext,
  ): Promise<OfflineDownloadEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const created = await client.offlineDownload.create({
      data: {
        userId: input.userId,
        bookId: input.bookId,
      },
    });
    return OfflineDownloadMapper.toEntity(created);
  }

  async restore(
    input: RestoreOfflineDownloadRepoInput,
    context?: TransactionContext,
  ): Promise<OfflineDownloadEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const restored = await client.offlineDownload.update({
      where: { id: input.id },
      data: { deletedAt: null },
    });
    return OfflineDownloadMapper.toEntity(restored);
  }

  async softDelete(id: number, context?: TransactionContext): Promise<OfflineDownloadEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const deleted = await client.offlineDownload.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return OfflineDownloadMapper.toEntity(deleted);
  }
}
