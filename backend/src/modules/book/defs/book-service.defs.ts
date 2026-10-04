import { AdminBookSortField, AdminSortOrder } from '@/modules/book/enum/admin-book-sort-field.enum';
import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

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

export type GetManagedBookServiceInput = {
  readonly bookId: number;
  readonly actorId: number;
  readonly actorRole: UserRole;
};

export type ListBookRejectionHistoryServiceInput = {
  readonly bookId: number;
  readonly actorId: number;
  readonly actorRole: UserRole;
  readonly limit?: number;
  readonly offset?: number;
};

export type ListBooksServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly publishingStatus?: BookPublishingStatus | readonly BookPublishingStatus[];
  readonly processingStatus?: BookProcessingStatus | readonly BookProcessingStatus[];
  readonly ownerId?: number | readonly number[];
  readonly categoryIds?: readonly number[];
  readonly bookTypes?: readonly BookType[];
  readonly layoutTypes?: readonly BookLayoutType[];
  readonly keyword?: string;
  readonly authorName?: string;
  readonly publisherName?: string;
  readonly catalogVisible?: boolean;
  readonly sortBy?: AdminBookSortField;
  readonly sortOrder?: AdminSortOrder;
};

export type ListCatalogBooksServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly categoryId?: number;
  readonly title?: string;
  readonly author?: string;
  readonly publisher?: string;
  readonly sort?: CatalogSort;
};

export type CountCatalogVisibleBooksServiceInput = {
  readonly ownerId?: number;
};

export type TransitionBookProcessingStatusInput = {
  readonly bookId: number;
  readonly to: BookProcessingStatus;
};

export type ChangeBookPublishingStatusServiceInput = {
  readonly bookId: number;
  readonly actorUserId: number;
};

export type RejectBookServiceInput = {
  readonly bookId: number;
  readonly actorUserId: number;
  readonly reason: string;
};

export type DeleteBookServiceInput = {
  readonly bookId: number;
  readonly actorUserId: number;
};

export type TransitionBookPublishingStatusInput = {
  readonly bookId: number;
  readonly to: BookPublishingStatus;
  readonly publishedAt?: Date | null;
  readonly actorUserId?: number;
  readonly reason?: string;
};
