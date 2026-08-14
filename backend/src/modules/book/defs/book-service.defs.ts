import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';

export type CreateBookServiceInput = {
  readonly title: string;
  readonly description: string;
  readonly layoutType?: BookLayoutType | null;
  readonly bookType: BookType;
  readonly ownerId: number;
  readonly categoryIds?: readonly number[];
};

export type UpdateBookServiceInput = {
  readonly id: number;
  readonly title?: string;
  readonly description?: string;
  readonly layoutType?: BookLayoutType | null;
  readonly bookType?: BookType;
  readonly publishingStatus?: BookPublishingStatus;
  readonly publishedAt?: Date | null;
  readonly categoryIds?: readonly number[];
};

export type ListBooksServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly publishingStatus?: BookPublishingStatus;
  readonly ownerId?: number;
};
