import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';

export abstract class BookSpreadRepository {
  abstract listByBookId(bookId: number): Promise<BookSpreadEntity[]>;
}
