import { BookPageTextRunEntity } from '@/modules/book-processing/entity/book-page-text-run.entity';

export abstract class BookPageTextRunRepository {
  abstract listByTextLayerId(textLayerId: number): Promise<BookPageTextRunEntity[]>;
}
