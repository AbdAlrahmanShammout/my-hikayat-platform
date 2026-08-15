import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateReadingProgressRepoInput,
  ListReadingProgressesRepoInput,
  ReadingProgressPage,
  UpdateReadingProgressRepoInput,
} from '@/modules/reading/defs/reading-progress-repository.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

export abstract class ReadingProgressRepository {
  abstract create(
    input: CreateReadingProgressRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingProgressEntity>;
  abstract update(
    input: UpdateReadingProgressRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingProgressEntity>;
  abstract list(input: ListReadingProgressesRepoInput): Promise<ReadingProgressPage>;
  abstract findById(id: number): Promise<ReadingProgressEntity | null>;
  abstract findByUserIdAndBookId(
    userId: number,
    bookId: number,
  ): Promise<ReadingProgressEntity | null>;
}
