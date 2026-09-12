import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { BookService } from '@/modules/book/book.service';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import { OFFLINE_DOWNLOAD_MAX_ACTIVE } from '@/modules/offline-download/consts/offline-download.constant';
import {
  RegisterOfflineDownloadServiceInput,
  ReleaseOfflineDownloadServiceInput,
} from '@/modules/offline-download/defs/offline-download-service.defs';
import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';
import { OfflineDownloadLimitReachedException } from '@/modules/offline-download/exceptions/offline-download-limit-reached.exception';
import { OfflineDownloadRepository } from '@/modules/offline-download/repository/offline-download.repository';

@Injectable()
export class OfflineDownloadService {
  constructor(
    private readonly offlineDownloadRepository: OfflineDownloadRepository,
    private readonly bookService: BookService,
    private readonly entitlementService: EntitlementService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async registerOfflineDownload(
    input: RegisterOfflineDownloadServiceInput,
  ): Promise<OfflineDownloadEntity> {
    await this.bookService.getCatalogBookById(input.bookId);
    await this.entitlementService.assertFullBookReadingAccess(input.userId);
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const existing: OfflineDownloadEntity | null =
        await this.offlineDownloadRepository.findByUserIdAndBookId(
          { userId: input.userId, bookId: input.bookId },
          context,
        );
      if (existing !== null && existing.deletedAt == null) {
        return existing;
      }
      const activeCount: number = await this.offlineDownloadRepository.countActiveByUserId(
        input.userId,
        context,
      );
      if (activeCount >= OFFLINE_DOWNLOAD_MAX_ACTIVE) {
        throw new OfflineDownloadLimitReachedException();
      }
      if (existing !== null) {
        return this.offlineDownloadRepository.restore({ id: existing.id }, context);
      }
      return this.offlineDownloadRepository.create(
        { userId: input.userId, bookId: input.bookId },
        context,
      );
    });
  }

  async releaseOfflineDownload(input: ReleaseOfflineDownloadServiceInput): Promise<void> {
    const existing: OfflineDownloadEntity | null =
      await this.offlineDownloadRepository.findByUserIdAndBookId({
        userId: input.userId,
        bookId: input.bookId,
      });
    if (existing === null || existing.deletedAt != null) {
      return;
    }
    await this.offlineDownloadRepository.softDelete(existing.id);
  }
}
