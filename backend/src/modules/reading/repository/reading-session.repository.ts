import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookActiveDurationTotal,
  CreateReadingSessionRepoInput,
  SumReadingSessionActiveDurationRepoInput,
  UpdateReadingSessionRepoInput,
} from '@/modules/reading/defs/reading-session-repository.defs';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';

export abstract class ReadingSessionRepository {
  abstract create(
    input: CreateReadingSessionRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingSessionEntity>;
  abstract update(
    input: UpdateReadingSessionRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingSessionEntity>;
  abstract findById(id: number): Promise<ReadingSessionEntity | null>;
  abstract findOpenByUserIdAndBookId(
    userId: number,
    bookId: number,
  ): Promise<ReadingSessionEntity | null>;
  abstract sumActiveDurationByBookInRange(
    input: SumReadingSessionActiveDurationRepoInput,
  ): Promise<BookActiveDurationTotal[]>;
}
