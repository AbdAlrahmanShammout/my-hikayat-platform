import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';

export type CreateBookRepoInput = {
  readonly title: string;
  readonly description: string;
  readonly layoutType: BookLayoutType | null;
  readonly bookType: BookType;
  readonly publishingStatus: BookPublishingStatus;
  readonly categoryIds: readonly number[];
};

export type UpdateBookRepoInput = {
  readonly id: number;
  readonly title?: string;
  readonly description?: string;
  readonly layoutType?: BookLayoutType | null;
  readonly bookType?: BookType;
  readonly publishingStatus?: BookPublishingStatus;
  readonly publishedAt?: Date | null;
  readonly categoryIds?: readonly number[];
};

export type ListBooksRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly publishingStatus?: BookPublishingStatus;
};

export type BookPage = {
  readonly entities: BookEntity[];
  readonly total: number;
};
