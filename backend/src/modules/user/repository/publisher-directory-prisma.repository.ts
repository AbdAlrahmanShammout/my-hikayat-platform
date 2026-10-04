import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BookProcessingStatus, BookPublishingStatus } from '@/modules/book/enum/general.enum';
import {
  ListPublishersInput,
  PublisherBookCounts,
  PublisherListPage,
  PublisherPublishingStatusCount,
  PublisherSummaryCounts,
} from '@/modules/user/defs/publisher-directory.defs';
import { AdminPublisherSortField } from '@/modules/user/enum/admin-publisher-sort-field.enum';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';
import { UserMapper } from '@/modules/user/mapper/user.mapper';
import { PublisherDirectoryRepository } from '@/modules/user/repository/publisher-directory.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

const PUBLISHER_REVENUE_PERIOD_LIMIT = 12;

@Injectable()
export class PublisherDirectoryPrismaRepository implements PublisherDirectoryRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async list(input: ListPublishersInput): Promise<PublisherListPage> {
    const where: Prisma.UserWhereInput = buildPublisherWhere(input.keyword);
    const total: number = await this.prismaProviderService.user.count({ where });
    const users =
      input.sortBy === AdminPublisherSortField.BOOK_COUNT
        ? await this.listUsersByBookCount(input, where)
        : await this.prismaProviderService.user.findMany({
            where,
            orderBy: buildPublisherOrderBy(input),
            take: input.limit,
            skip: input.offset,
          });
    const counts: Map<number, PublisherBookCounts> = await this.countBooksForOwners(
      users.map((user) => user.id),
    );
    return {
      total,
      rows: users.map((user) => ({
        user: UserMapper.toEntity(user),
        counts: counts.get(user.id) ?? { bookCount: 0, catalogVisibleBookCount: 0 },
      })),
    };
  }

  async summarize(ownerId: number): Promise<PublisherSummaryCounts> {
    const [statusGroups, catalogVisible, unpublishedApprovedCount, revenuePeriods] =
      await Promise.all([
        this.prismaProviderService.book.groupBy({
          by: ['publishingStatus'],
          where: { ownerId, deletedAt: null },
          _count: { _all: true },
        }),
        this.prismaProviderService.book.count({
          where: {
            ownerId,
            deletedAt: null,
            publishingStatus: BookPublishingStatus.APPROVED,
            processingStatus: BookProcessingStatus.READY,
            publishedAt: { not: null },
          },
        }),
        this.prismaProviderService.book.count({
          where: {
            ownerId,
            deletedAt: null,
            publishingStatus: BookPublishingStatus.APPROVED,
            publishedAt: null,
          },
        }),
        this.prismaProviderService.bookRevenue.groupBy({
          by: ['revenuePeriodId'],
          where: { ownerId, deletedAt: null },
          _max: { createdAt: true },
          orderBy: { _max: { createdAt: 'desc' } },
          take: PUBLISHER_REVENUE_PERIOD_LIMIT,
        }),
      ]);
    const publishingStatusCounts: PublisherPublishingStatusCount[] = Object.values(
      BookPublishingStatus,
    ).map((publishingStatus: BookPublishingStatus) => ({
      publishingStatus,
      count:
        statusGroups.find((group) => String(group.publishingStatus) === String(publishingStatus))
          ?._count._all ?? 0,
    }));
    const total: number = publishingStatusCounts.reduce(
      (sum: number, row: PublisherPublishingStatusCount) => sum + row.count,
      0,
    );
    return {
      total,
      catalogVisible,
      unpublishedApprovedCount,
      publishingStatusCounts,
      revenuePeriodIds: revenuePeriods.map((row) => row.revenuePeriodId),
    };
  }

  private async listUsersByBookCount(
    input: ListPublishersInput,
    where: Prisma.UserWhereInput,
  ): Promise<Prisma.UserGetPayload<object>[]> {
    const direction: Prisma.Sql =
      input.sortOrder === AdminUserSortOrder.ASC ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const keywordClause: Prisma.Sql = buildKeywordClause(input.keyword);
    const idRows = await this.prismaProviderService.$queryRaw<{ id: number }[]>`
      SELECT u.id
      FROM "User" u
      LEFT JOIN "Book" b ON b."ownerId" = u.id AND b."deletedAt" IS NULL
      WHERE u."isPublisher" = true
        AND u."deletedAt" IS NULL
        ${keywordClause}
      GROUP BY u.id
      ORDER BY COUNT(b.id) ${direction}, u.id DESC
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `;
    const ids: number[] = idRows.map((row) => row.id);
    if (ids.length === 0) {
      return [];
    }
    const users = await this.prismaProviderService.user.findMany({
      where: { ...where, id: { in: ids } },
    });
    return ids.flatMap((id: number) => {
      const user = users.find((row) => row.id === id);
      return user === undefined ? [] : [user];
    });
  }

  private async countBooksForOwners(
    ownerIds: readonly number[],
  ): Promise<Map<number, PublisherBookCounts>> {
    const counts = new Map<number, PublisherBookCounts>();
    if (ownerIds.length === 0) {
      return counts;
    }
    const [totals, visible] = await Promise.all([
      this.prismaProviderService.book.groupBy({
        by: ['ownerId'],
        where: { deletedAt: null, ownerId: { in: [...ownerIds] } },
        _count: { _all: true },
      }),
      this.prismaProviderService.book.groupBy({
        by: ['ownerId'],
        where: {
          deletedAt: null,
          ownerId: { in: [...ownerIds] },
          publishingStatus: BookPublishingStatus.APPROVED,
          processingStatus: BookProcessingStatus.READY,
          publishedAt: { not: null },
        },
        _count: { _all: true },
      }),
    ]);
    for (const ownerId of ownerIds) {
      counts.set(ownerId, {
        bookCount: totals.find((row) => row.ownerId === ownerId)?._count._all ?? 0,
        catalogVisibleBookCount: visible.find((row) => row.ownerId === ownerId)?._count._all ?? 0,
      });
    }
    return counts;
  }
}

function buildPublisherWhere(keyword: string | undefined): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { deletedAt: null, isPublisher: true };
  if (keyword !== undefined) {
    where.OR = [
      { email: { contains: keyword, mode: 'insensitive' } },
      { displayName: { contains: keyword, mode: 'insensitive' } },
    ];
  }
  return where;
}

function buildPublisherOrderBy(input: ListPublishersInput): Prisma.UserOrderByWithRelationInput[] {
  const direction: Prisma.SortOrder = input.sortOrder === AdminUserSortOrder.ASC ? 'asc' : 'desc';
  if (input.sortBy === AdminPublisherSortField.EMAIL) {
    return [{ email: direction }, { id: 'desc' }];
  }
  return [{ createdAt: direction }, { id: 'desc' }];
}

function buildKeywordClause(keyword: string | undefined): Prisma.Sql {
  if (keyword === undefined) {
    return Prisma.empty;
  }
  const pattern = `%${escapeLike(keyword)}%`;
  return Prisma.sql`AND (u.email ILIKE ${pattern} ESCAPE '\\' OR u."displayName" ILIKE ${pattern} ESCAPE '\\')`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character: string) => `\\${character}`);
}
