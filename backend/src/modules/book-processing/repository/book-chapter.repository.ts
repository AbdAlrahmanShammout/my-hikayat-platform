import { ReplaceBookChaptersRepoInput } from '@/modules/book-processing/defs/book-chapter-repository.defs';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';

export abstract class BookChapterRepository {
  abstract replaceByBookId(input: ReplaceBookChaptersRepoInput): Promise<BookChapterEntity[]>;
  abstract listByBookId(bookId: number): Promise<BookChapterEntity[]>;
}
