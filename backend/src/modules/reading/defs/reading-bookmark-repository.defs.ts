import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';

export type CreateReadingBookmarkRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly layoutType: BookLayoutType;
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
};

export type ListReadingBookmarksRepoInput = {
  readonly userId: number;
  readonly bookId?: number;
  readonly updatedSince?: Date;
  readonly limit?: number;
  readonly offset?: number;
};

export type ReadingBookmarkPage = {
  readonly entities: ReadingBookmarkEntity[];
  readonly total: number;
};
