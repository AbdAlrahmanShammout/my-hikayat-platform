import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { AdminBookSortField, AdminSortOrder } from '@/modules/book/enum/admin-book-sort-field.enum';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import {
  PublisherListPage,
  PublisherRecentBook,
  PublisherSummaryCounts,
} from '@/modules/user/defs/publisher-directory.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminPublisherSortField } from '@/modules/user/enum/admin-publisher-sort-field.enum';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';
import { PublisherDirectoryRepository } from '@/modules/user/repository/publisher-directory.repository';
import { UserService } from '@/modules/user/user.service';

const PUBLISHER_RECENT_BOOK_LIMIT = 5;

export type ListPublishersServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly keyword?: string;
  readonly sortBy?: AdminPublisherSortField;
  readonly sortOrder?: AdminUserSortOrder;
};

export type GetPublisherSummaryServiceInput = {
  readonly userId: number;
  readonly revenuePeriodId?: number;
};

export type PublisherSummary = {
  readonly user: UserEntity;
  readonly counts: PublisherSummaryCounts;
  readonly lifetimeAuthorCents: number;
  readonly recentBooks: readonly PublisherRecentBook[];
};

@Injectable()
export class PublisherDirectoryService {
  constructor(
    private readonly publisherDirectoryRepository: PublisherDirectoryRepository,
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly bookRevenueService: BookRevenueService,
  ) {}

  async listPublishers(input: ListPublishersServiceInput = {}): Promise<PublisherListPage> {
    const sortBy: AdminPublisherSortField = input.sortBy ?? AdminPublisherSortField.CREATED_AT;
    return this.publisherDirectoryRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      keyword: normalizeKeyword(input.keyword),
      sortBy,
      sortOrder: input.sortOrder ?? defaultSortOrder(sortBy),
    });
  }

  async getPublisherSummary(input: GetPublisherSummaryServiceInput): Promise<PublisherSummary> {
    const user: UserEntity = await this.userService.getUserById(input.userId);
    if (!user.isPublisher) {
      throw new ResourceNotFoundException('Publisher', input.userId);
    }
    const [counts, lifetimeAuthorCents, recentPage] = await Promise.all([
      this.publisherDirectoryRepository.summarize(user.id),
      this.bookRevenueService.sumAuthorCents({
        ownerId: user.id,
        revenuePeriodId: input.revenuePeriodId,
      }),
      this.bookService.listBooks({
        ownerId: user.id,
        limit: PUBLISHER_RECENT_BOOK_LIMIT,
        offset: 0,
        sortBy: AdminBookSortField.CREATED_AT,
        sortOrder: AdminSortOrder.DESC,
      }),
    ]);
    return {
      user,
      counts,
      lifetimeAuthorCents,
      recentBooks: recentPage.entities.map((book) => ({
        id: book.id,
        title: book.title,
        publishingStatus: book.publishingStatus,
        authorName: book.authorName ?? null,
        publisherName: book.publisherName ?? null,
      })),
    };
  }
}

function normalizeKeyword(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized: string = value.trim().replace(/\s+/g, ' ');
  return normalized.length === 0 ? undefined : normalized;
}

function defaultSortOrder(sortBy: AdminPublisherSortField): AdminUserSortOrder {
  return sortBy === AdminPublisherSortField.EMAIL
    ? AdminUserSortOrder.ASC
    : AdminUserSortOrder.DESC;
}
