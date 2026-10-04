import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminPublisherSortField } from '@/modules/user/enum/admin-publisher-sort-field.enum';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';

export type ListPublishersInput = {
  readonly limit: number;
  readonly offset: number;
  readonly keyword?: string;
  readonly sortBy: AdminPublisherSortField;
  readonly sortOrder: AdminUserSortOrder;
};

export type PublisherBookCounts = {
  readonly bookCount: number;
  readonly catalogVisibleBookCount: number;
};

export type PublisherListRow = {
  readonly user: UserEntity;
  readonly counts: PublisherBookCounts;
};

export type PublisherListPage = {
  readonly rows: readonly PublisherListRow[];
  readonly total: number;
};

export type PublisherPublishingStatusCount = {
  readonly publishingStatus: BookPublishingStatus;
  readonly count: number;
};

export type PublisherSummaryCounts = {
  readonly total: number;
  readonly catalogVisible: number;
  readonly unpublishedApprovedCount: number;
  readonly publishingStatusCounts: readonly PublisherPublishingStatusCount[];
  readonly revenuePeriodIds: readonly number[];
};

export type PublisherRecentBook = {
  readonly id: number;
  readonly title: string;
  readonly publishingStatus: BookPublishingStatus;
  readonly authorName: string | null;
  readonly publisherName: string | null;
};
