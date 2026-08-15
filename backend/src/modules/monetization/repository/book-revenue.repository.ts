import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookRevenuePage,
  ListBookRevenuesRepoInput,
  ReplaceBookRevenuesForPeriodRepoInput,
  SumAuthorCentsRepoInput,
} from '@/modules/monetization/defs/book-revenue-repository.defs';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';

export abstract class BookRevenueRepository {
  abstract replaceForPeriod(
    input: ReplaceBookRevenuesForPeriodRepoInput,
    context?: TransactionContext,
  ): Promise<BookRevenueEntity[]>;
  abstract list(input: ListBookRevenuesRepoInput): Promise<BookRevenuePage>;
  abstract findById(id: number): Promise<BookRevenueEntity | null>;
  abstract findByPeriodAndBook(
    revenuePeriodId: number,
    bookId: number,
  ): Promise<BookRevenueEntity | null>;
  abstract sumAuthorCents(input: SumAuthorCentsRepoInput): Promise<number>;
}
