import {
  BookFixedLayoutStructure,
  ReplaceBookFixedLayoutRepoInput,
} from '@/modules/book-processing/defs/book-page-repository.defs';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';

export abstract class BookPageRepository {
  abstract replaceByBookId(
    input: ReplaceBookFixedLayoutRepoInput,
  ): Promise<BookFixedLayoutStructure>;
  abstract listByBookId(bookId: number): Promise<BookPageEntity[]>;
}
