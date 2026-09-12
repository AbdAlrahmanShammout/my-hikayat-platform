import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateOfflineDownloadRepoInput,
  FindOfflineDownloadRepoInput,
  RestoreOfflineDownloadRepoInput,
} from '@/modules/offline-download/defs/offline-download-repository.defs';
import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';

export abstract class OfflineDownloadRepository {
  abstract findByUserIdAndBookId(
    input: FindOfflineDownloadRepoInput,
    context?: TransactionContext,
  ): Promise<OfflineDownloadEntity | null>;
  abstract countActiveByUserId(userId: number, context?: TransactionContext): Promise<number>;
  abstract create(
    input: CreateOfflineDownloadRepoInput,
    context?: TransactionContext,
  ): Promise<OfflineDownloadEntity>;
  abstract restore(
    input: RestoreOfflineDownloadRepoInput,
    context?: TransactionContext,
  ): Promise<OfflineDownloadEntity>;
  abstract softDelete(id: number, context?: TransactionContext): Promise<OfflineDownloadEntity>;
}
