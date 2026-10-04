import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  ReadingAccessState,
  resolveReadingAccessState,
} from '@/modules/subscription/resolve-reading-access-state.helper';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

export const ADMIN_SEARCH_TYPES = [
  'users',
  'books',
  'epubAuthors',
  'publishers',
  'categories',
  'subscriptions',
] as const;

export type AdminSearchType = (typeof ADMIN_SEARCH_TYPES)[number];

export type AdminSearchGroup<TItem> = {
  readonly items: readonly TItem[];
  readonly total: number;
};

export type AdminSearchResult = {
  readonly query: string;
  readonly users: AdminSearchGroup<{
    id: number;
    email: string;
    displayName: string | null;
    role: string;
    isPublisher: boolean;
  }>;
  readonly books: AdminSearchGroup<{
    id: number;
    title: string;
    publishingStatus: string;
    authorName: string | null;
    publisherName: string | null;
    ownerId: number;
  }>;
  readonly epubAuthors: AdminSearchGroup<{ creator: string; bookCount: number }>;
  readonly publishers: AdminSearchResult['users'];
  readonly categories: AdminSearchGroup<{ id: number; name: string; slug: string }>;
  readonly subscriptions: AdminSearchGroup<{
    id: number;
    userId: number;
    userEmail: string;
    status: string;
    planName: string;
    readingAccessState: ReadingAccessState;
  }>;
};

@Injectable()
export class AdminSearchService {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async search(input: {
    readonly query: string;
    readonly type?: AdminSearchType;
    readonly limit: number;
    readonly offset: number;
  }): Promise<AdminSearchResult> {
    const query: string = input.query.trim();
    const contains = `%${escapeLike(query)}%`;
    const prefix = `${escapeLike(query)}%`;
    const empty = { items: [], total: 0 };
    const wanted = input.type;
    const [users, books, epubAuthors, publishers, categories, subscriptions] = await Promise.all([
      wanted === undefined || wanted === 'users'
        ? this.searchUsers({
            query,
            contains,
            prefix,
            limit: input.limit,
            offset: input.offset,
            publishersOnly: false,
          })
        : Promise.resolve(empty),
      wanted === undefined || wanted === 'books'
        ? this.searchBooks({ query, contains, prefix, limit: input.limit, offset: input.offset })
        : Promise.resolve(empty),
      wanted === undefined || wanted === 'epubAuthors'
        ? this.searchCreators({ query, contains, prefix, limit: input.limit, offset: input.offset })
        : Promise.resolve(empty),
      wanted === undefined || wanted === 'publishers'
        ? this.searchUsers({
            query,
            contains,
            prefix,
            limit: input.limit,
            offset: input.offset,
            publishersOnly: true,
          })
        : Promise.resolve(empty),
      wanted === undefined || wanted === 'categories'
        ? this.searchCategories({
            query,
            contains,
            prefix,
            limit: input.limit,
            offset: input.offset,
          })
        : Promise.resolve(empty),
      wanted === undefined || wanted === 'subscriptions'
        ? this.searchSubscriptions({
            query,
            contains,
            prefix,
            limit: input.limit,
            offset: input.offset,
          })
        : Promise.resolve(empty),
    ]);
    return { query, users, books, epubAuthors, publishers, categories, subscriptions };
  }

  private async searchUsers(
    input: SearchClause & { readonly publishersOnly: boolean },
  ): Promise<AdminSearchResult['users']> {
    const publisherClause: Prisma.Sql = input.publishersOnly
      ? Prisma.sql`AND u."isPublisher" = true`
      : Prisma.empty;
    const rows = await this.prismaProviderService.$queryRaw<
      {
        id: number;
        email: string;
        displayName: string | null;
        role: string;
        isPublisher: boolean;
      }[]
    >`
      SELECT u.id, u.email, u."displayName", u.role::text AS role, u."isPublisher"
      FROM "User" u
      WHERE u."deletedAt" IS NULL
        ${publisherClause}
        AND (u.email ILIKE ${input.contains} ESCAPE '\\' OR u."displayName" ILIKE ${input.contains} ESCAPE '\\')
      ORDER BY
        CASE
          WHEN lower(u.email) = lower(${input.query}) OR lower(coalesce(u."displayName", '')) = lower(${input.query}) THEN 0
          WHEN u.email ILIKE ${input.prefix} ESCAPE '\\' OR u."displayName" ILIKE ${input.prefix} ESCAPE '\\' THEN 1
          ELSE 2
        END,
        u.id DESC
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `;
    const totalRows = await this.prismaProviderService.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total
      FROM "User" u
      WHERE u."deletedAt" IS NULL
        ${publisherClause}
        AND (u.email ILIKE ${input.contains} ESCAPE '\\' OR u."displayName" ILIKE ${input.contains} ESCAPE '\\')
    `;
    return { items: rows, total: totalRows[0]?.total ?? 0 };
  }

  private async searchBooks(input: SearchClause): Promise<AdminSearchResult['books']> {
    const rows = await this.prismaProviderService.$queryRaw<
      {
        id: number;
        title: string;
        publishingStatus: string;
        authorName: string | null;
        publisherName: string | null;
        ownerId: number;
      }[]
    >`
      SELECT b.id, b.title, b."publishingStatus"::text AS "publishingStatus", b."ownerId",
        m.creator AS "authorName", m.publisher AS "publisherName"
      FROM "Book" b
      LEFT JOIN "BookSourceMetadata" m ON m."bookId" = b.id AND m."deletedAt" IS NULL
      WHERE b."deletedAt" IS NULL
        AND (
          b.title ILIKE ${input.contains} ESCAPE '\\'
          OR b.description ILIKE ${input.contains} ESCAPE '\\'
          OR m.creator ILIKE ${input.contains} ESCAPE '\\'
          OR m.publisher ILIKE ${input.contains} ESCAPE '\\'
        )
      ORDER BY
        CASE
          WHEN lower(b.title) = lower(${input.query}) THEN 0
          WHEN b.title ILIKE ${input.prefix} ESCAPE '\\' THEN 1
          ELSE 2
        END,
        b.id DESC
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `;
    const totalRows = await this.prismaProviderService.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total
      FROM "Book" b
      LEFT JOIN "BookSourceMetadata" m ON m."bookId" = b.id AND m."deletedAt" IS NULL
      WHERE b."deletedAt" IS NULL
        AND (
          b.title ILIKE ${input.contains} ESCAPE '\\'
          OR b.description ILIKE ${input.contains} ESCAPE '\\'
          OR m.creator ILIKE ${input.contains} ESCAPE '\\'
          OR m.publisher ILIKE ${input.contains} ESCAPE '\\'
        )
    `;
    return { items: rows, total: totalRows[0]?.total ?? 0 };
  }

  private async searchCreators(input: SearchClause): Promise<AdminSearchResult['epubAuthors']> {
    const rows = await this.prismaProviderService.$queryRaw<
      { creator: string; bookCount: number }[]
    >`
      SELECT m.creator AS creator, COUNT(*)::int AS "bookCount"
      FROM "BookSourceMetadata" m
      JOIN "Book" b ON b.id = m."bookId"
      WHERE b."deletedAt" IS NULL
        AND m."deletedAt" IS NULL
        AND m.creator ILIKE ${input.contains} ESCAPE '\\'
      GROUP BY m.creator
      ORDER BY
        CASE
          WHEN lower(m.creator) = lower(${input.query}) THEN 0
          WHEN m.creator ILIKE ${input.prefix} ESCAPE '\\' THEN 1
          ELSE 2
        END,
        m.creator ASC
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `;
    const totalRows = await this.prismaProviderService.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM (
        SELECT m.creator
        FROM "BookSourceMetadata" m
        JOIN "Book" b ON b.id = m."bookId"
        WHERE b."deletedAt" IS NULL AND m."deletedAt" IS NULL AND m.creator ILIKE ${input.contains} ESCAPE '\\'
        GROUP BY m.creator
      ) creators
    `;
    return { items: rows, total: totalRows[0]?.total ?? 0 };
  }

  private async searchCategories(input: SearchClause): Promise<AdminSearchResult['categories']> {
    const rows = await this.prismaProviderService.$queryRaw<
      { id: number; name: string; slug: string }[]
    >`
      SELECT id, name, slug
      FROM "Category"
      WHERE "deletedAt" IS NULL
        AND (name ILIKE ${input.contains} ESCAPE '\\' OR slug ILIKE ${input.contains} ESCAPE '\\')
      ORDER BY
        CASE
          WHEN lower(name) = lower(${input.query}) OR lower(slug) = lower(${input.query}) THEN 0
          WHEN name ILIKE ${input.prefix} ESCAPE '\\' OR slug ILIKE ${input.prefix} ESCAPE '\\' THEN 1
          ELSE 2
        END,
        id DESC
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `;
    const totalRows = await this.prismaProviderService.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total
      FROM "Category"
      WHERE "deletedAt" IS NULL
        AND (name ILIKE ${input.contains} ESCAPE '\\' OR slug ILIKE ${input.contains} ESCAPE '\\')
    `;
    return { items: rows, total: totalRows[0]?.total ?? 0 };
  }

  private async searchSubscriptions(
    input: SearchClause,
  ): Promise<AdminSearchResult['subscriptions']> {
    const rows = await this.prismaProviderService.$queryRaw<
      {
        id: number;
        userId: number;
        userEmail: string;
        status: string;
        planName: string;
        planKind: string;
        currentPeriodEnd: Date | null;
        trialStartedAt: Date | null;
        trialEndsAt: Date | null;
      }[]
    >`
      SELECT s.id, s."userId", u.email AS "userEmail", s.status::text AS status, p.name AS "planName",
        p.kind::text AS "planKind", s."currentPeriodEnd", s."trialStartedAt", s."trialEndsAt"
      FROM "Subscription" s
      JOIN "User" u ON u.id = s."userId"
      JOIN "Plan" p ON p.id = s."planId"
      WHERE s."deletedAt" IS NULL
        AND (u.email ILIKE ${input.contains} ESCAPE '\\' OR p.name ILIKE ${input.contains} ESCAPE '\\')
      ORDER BY
        CASE
          WHEN lower(u.email) = lower(${input.query}) OR lower(p.name) = lower(${input.query}) THEN 0
          WHEN u.email ILIKE ${input.prefix} ESCAPE '\\' OR p.name ILIKE ${input.prefix} ESCAPE '\\' THEN 1
          ELSE 2
        END,
        s.id DESC
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `;
    const totalRows = await this.prismaProviderService.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total
      FROM "Subscription" s
      JOIN "User" u ON u.id = s."userId"
      JOIN "Plan" p ON p.id = s."planId"
      WHERE s."deletedAt" IS NULL
        AND (u.email ILIKE ${input.contains} ESCAPE '\\' OR p.name ILIKE ${input.contains} ESCAPE '\\')
    `;
    return {
      total: totalRows[0]?.total ?? 0,
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userEmail: row.userEmail,
        status: row.status,
        planName: row.planName,
        readingAccessState: resolveReadingAccessState(
          new SubscriptionEntity({
            id: row.id,
            createdAt: new Date(0),
            updatedAt: new Date(0),
            userId: row.userId,
            planId: 0,
            status: row.status as SubscriptionStatus,
            startedAt: new Date(0),
            currentPeriodStart: null,
            currentPeriodEnd: row.currentPeriodEnd,
            canceledAt: null,
            activatedAt: null,
            trialStartedAt: row.trialStartedAt,
            trialEndsAt: row.trialEndsAt,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            plan: new PlanEntity({
              id: 0,
              createdAt: new Date(0),
              updatedAt: new Date(0),
              slug: 'search',
              name: row.planName,
              description: '',
              kind: row.planKind as PlanKind,
              interval: null,
              stripePriceId: null,
              amountCents: null,
              currency: null,
            }),
          }),
        ),
      })),
    };
  }
}

type SearchClause = {
  readonly query: string;
  readonly contains: string;
  readonly prefix: string;
  readonly limit: number;
  readonly offset: number;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character: string) => `\\${character}`);
}
