import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookEngagementPage,
  ListBookEngagementsRepoInput,
  ReplaceBookEngagementsForPeriodRepoInput,
} from '@/modules/monetization/defs/book-engagement-repository.defs';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';

export abstract class BookEngagementRepository {
  abstract replaceForPeriod(
    input: ReplaceBookEngagementsForPeriodRepoInput,
    context?: TransactionContext,
  ): Promise<BookEngagementEntity[]>;
  abstract list(input: ListBookEngagementsRepoInput): Promise<BookEngagementPage>;
  abstract findById(id: number): Promise<BookEngagementEntity | null>;
  abstract findByPeriodAndBook(
    revenuePeriodId: number,
    bookId: number,
  ): Promise<BookEngagementEntity | null>;
}
