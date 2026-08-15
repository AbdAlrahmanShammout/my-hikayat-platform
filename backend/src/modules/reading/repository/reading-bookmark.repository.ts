import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateReadingBookmarkRepoInput,
  ListReadingBookmarksRepoInput,
  ReadingBookmarkPage,
} from '@/modules/reading/defs/reading-bookmark-repository.defs';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';

export abstract class ReadingBookmarkRepository {
  abstract create(
    input: CreateReadingBookmarkRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingBookmarkEntity>;
  abstract list(input: ListReadingBookmarksRepoInput): Promise<ReadingBookmarkPage>;
  abstract findById(id: number): Promise<ReadingBookmarkEntity | null>;
  abstract delete(id: number, context?: TransactionContext): Promise<ReadingBookmarkEntity>;
}
