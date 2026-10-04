import { Injectable } from '@nestjs/common';

import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { AdminBookSortField, AdminSortOrder } from '@/modules/book/enum/admin-book-sort-field.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import {
  ADMIN_EXPORT_BATCH_SIZE,
  AdminExportResource,
} from '@/modules/admin-export/admin-export.constants';
import { resolveReadingAccessState } from '@/modules/subscription/resolve-reading-access-state.helper';
import { SubscriptionMapper } from '@/modules/subscription/mapper/subscription.mapper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { AdminInvitationService } from '@/modules/user/admin-invitation.service';
import { AdminInvitationListStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminPublisherSortField } from '@/modules/user/enum/admin-publisher-sort-field.enum';
import {
  AdminUserSortField,
  AdminUserSortOrder,
} from '@/modules/user/enum/admin-user-sort-field.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PublisherDirectoryService } from '@/modules/user/publisher-directory.service';
import { UserService } from '@/modules/user/user.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

export type AdminExportSnapshot = {
  readonly resource: AdminExportResource;
  readonly filters: Readonly<Record<string, unknown>>;
  readonly selectedIds: readonly number[] | null;
  readonly sortBy: string | null;
  readonly sortOrder: AdminUserSortOrder | null;
};

@Injectable()
export class AdminExportQueryService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly publisherDirectoryService: PublisherDirectoryService,
    private readonly subscriptionService: SubscriptionService,
    private readonly adminInvitationService: AdminInvitationService,
    private readonly auditLogService: AuditLogService,
    private readonly prismaProviderService: PrismaProviderService,
  ) {}

  async count(snapshot: AdminExportSnapshot): Promise<number> {
    if (snapshot.selectedIds !== null) {
      return this.countSelected(snapshot);
    }
    const page = await this.fetch(snapshot, 1, 0);
    return page.total;
  }

  async fetchRows(
    snapshot: AdminExportSnapshot,
    offset: number,
  ): Promise<Record<string, unknown>[]> {
    const page = await this.fetch(snapshot, ADMIN_EXPORT_BATCH_SIZE, offset);
    return page.rows;
  }

  private async countSelected(snapshot: AdminExportSnapshot): Promise<number> {
    const ids: number[] = [...(snapshot.selectedIds ?? [])];
    if (ids.length === 0) {
      return 0;
    }
    if (snapshot.resource === 'publishers') {
      return this.prismaProviderService.user.count({
        where: { id: { in: ids }, deletedAt: null, isPublisher: true },
      });
    }
    if (snapshot.resource === 'users') {
      return this.prismaProviderService.user.count({ where: { id: { in: ids }, deletedAt: null } });
    }
    if (snapshot.resource === 'books') {
      return this.prismaProviderService.book.count({ where: { id: { in: ids }, deletedAt: null } });
    }
    if (snapshot.resource === 'subscriptions') {
      return this.prismaProviderService.subscription.count({
        where: { id: { in: ids }, deletedAt: null },
      });
    }
    if (snapshot.resource === 'invitations') {
      return this.prismaProviderService.adminInvitation.count({
        where: { id: { in: ids }, deletedAt: null },
      });
    }
    return this.prismaProviderService.auditLog.count({
      where: { id: { in: ids }, deletedAt: null },
    });
  }

  private async fetch(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    if (snapshot.selectedIds !== null) {
      return this.fetchSelected(snapshot, limit, offset);
    }
    if (snapshot.resource === 'users') {
      return this.fetchUsers(snapshot, limit, offset, false);
    }
    if (snapshot.resource === 'publishers') {
      return this.fetchPublishers(snapshot, limit, offset);
    }
    if (snapshot.resource === 'books') {
      return this.fetchBooks(snapshot, limit, offset);
    }
    if (snapshot.resource === 'subscriptions') {
      return this.fetchSubscriptions(snapshot, limit, offset);
    }
    if (snapshot.resource === 'invitations') {
      return this.fetchInvitations(snapshot, limit, offset);
    }
    return this.fetchAuditLogs(snapshot, limit, offset);
  }

  private async fetchUsers(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
    publishersOnly: boolean,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const page = await this.userService.listManagedUsers({
      limit,
      offset,
      role: readEnum(snapshot.filters.role, UserRole),
      email: readString(snapshot.filters.email),
      keyword: readString(snapshot.filters.q),
      isPublisher: publishersOnly ? true : readBoolean(snapshot.filters.isPublisher),
      sortBy: readEnum(snapshot.sortBy, AdminUserSortField),
      sortOrder: snapshot.sortOrder ?? undefined,
    });
    return {
      total: page.total,
      rows: page.items.map((item) => ({
        id: item.user.id,
        email: item.user.email,
        displayName: item.user.displayName,
        role: item.user.role,
        isPublisher: item.user.isPublisher,
        createdAt: item.user.createdAt,
      })),
    };
  }

  private async fetchPublishers(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const page = await this.publisherDirectoryService.listPublishers({
      limit,
      offset,
      keyword: readString(snapshot.filters.q),
      sortBy: readEnum(snapshot.sortBy, AdminPublisherSortField),
      sortOrder: snapshot.sortOrder ?? undefined,
    });
    return {
      total: page.total,
      rows: page.rows.map((row) => ({
        id: row.user.id,
        email: row.user.email,
        displayName: row.user.displayName,
        role: row.user.role,
        bookCount: row.counts.bookCount,
        catalogVisibleBookCount: row.counts.catalogVisibleBookCount,
        createdAt: row.user.createdAt,
      })),
    };
  }

  private async fetchBooks(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const page = await this.bookService.listBooks({
      limit,
      offset,
      keyword: readString(snapshot.filters.q),
      authorName: readString(snapshot.filters.authorName),
      publisherName: readString(snapshot.filters.publisherName),
      ownerId: readNumberList(snapshot.filters.ownerId),
      categoryIds: readNumberList(snapshot.filters.categoryId),
      publishingStatus: readEnumList(snapshot.filters.publishingStatus, BookPublishingStatus),
      processingStatus: readEnumList(snapshot.filters.processingStatus, BookProcessingStatus),
      bookTypes: readEnumList(snapshot.filters.bookType, BookType),
      layoutTypes: readEnumList(snapshot.filters.layoutType, BookLayoutType),
      catalogVisible: readBoolean(snapshot.filters.catalogVisible),
      sortBy: readEnum(snapshot.sortBy, AdminBookSortField),
      sortOrder: readEnum(snapshot.sortOrder, AdminSortOrder),
    });
    return {
      total: page.total,
      rows: page.entities.map((book) => ({
        id: book.id,
        title: book.title,
        publishingStatus: book.publishingStatus,
        processingStatus: book.processingStatus,
        bookType: book.bookType,
        layoutType: book.layoutType,
        ownerId: book.ownerId,
        authorName: book.authorName ?? null,
        publisherName: book.publisherName ?? null,
        createdAt: book.createdAt,
      })),
    };
  }

  private async fetchSubscriptions(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const page = await this.subscriptionService.listSubscriptions({
      limit,
      offset,
      userId: readNumber(snapshot.filters.userId),
      status: readEnum(snapshot.filters.status, SubscriptionStatus),
    });
    return {
      total: page.total,
      rows: page.entities.map((subscription) => ({
        id: subscription.id,
        userId: subscription.userId,
        status: subscription.status,
        planName: subscription.plan?.name ?? '',
        currentPeriodEnd: subscription.currentPeriodEnd,
        readingAccessState: resolveReadingAccessState(subscription),
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      })),
    };
  }

  private async fetchInvitations(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const page = await this.adminInvitationService.listInvitations({
      limit,
      offset,
      status: readEnum(snapshot.filters.status, AdminInvitationListStatus),
      email: readString(snapshot.filters.email),
    });
    return {
      total: page.total,
      rows: page.entities.map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        lastSentAt: invitation.lastSentAt,
        resendCount: invitation.resendCount,
        revokedAt: invitation.revokedAt,
        revokeReason: invitation.revokeReason,
        createdAt: invitation.createdAt,
      })),
    };
  }

  private async fetchAuditLogs(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const page = await this.auditLogService.listAuditLogs({
      limit,
      offset,
      actorUserId: readNumber(snapshot.filters.actorUserId),
      action: readEnum(snapshot.filters.action, AuditAction),
      subjectType: readEnum(snapshot.filters.subjectType, AuditSubjectType),
      subjectId: readNumber(snapshot.filters.subjectId),
    });
    return {
      total: page.total,
      rows: page.entities.map((entry) => ({
        id: entry.id,
        actorUserId: entry.actorUserId,
        action: entry.action,
        subjectType: entry.subjectType,
        subjectId: entry.subjectId,
        reason: entry.reason,
        createdAt: entry.createdAt,
      })),
    };
  }

  private async fetchSelected(
    snapshot: AdminExportSnapshot,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: Record<string, unknown>[]; readonly total: number }> {
    const ids: number[] = [...(snapshot.selectedIds ?? [])].slice(offset, offset + limit);
    const total: number = await this.countSelected(snapshot);
    if (ids.length === 0) {
      return { rows: [], total };
    }
    if (snapshot.resource === 'books') {
      const books = await this.bookService.listBooksByIds(ids);
      return {
        total,
        rows: books.map((book) => ({
          id: book.id,
          title: book.title,
          publishingStatus: book.publishingStatus,
          processingStatus: book.processingStatus,
          bookType: book.bookType,
          layoutType: book.layoutType,
          ownerId: book.ownerId,
          authorName: book.authorName ?? null,
          publisherName: book.publisherName ?? null,
          createdAt: book.createdAt,
        })),
      };
    }
    return { rows: await this.rowsForSelectedIds(snapshot.resource, ids), total };
  }

  private async rowsForSelectedIds(
    resource: AdminExportResource,
    ids: readonly number[],
  ): Promise<Record<string, unknown>[]> {
    if (resource === 'users' || resource === 'publishers') {
      const users = await this.prismaProviderService.user.findMany({
        where: {
          id: { in: [...ids] },
          deletedAt: null,
          ...(resource === 'publishers' ? { isPublisher: true } : {}),
        },
      });
      return users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isPublisher: user.isPublisher,
        createdAt: user.createdAt,
        bookCount: 0,
        catalogVisibleBookCount: 0,
      }));
    }
    if (resource === 'subscriptions') {
      const rows = await this.prismaProviderService.subscription.findMany({
        where: { id: { in: [...ids] }, deletedAt: null },
        include: { plan: true, user: true },
      });
      return rows.map((subscription) => {
        const entity = SubscriptionMapper.toEntity(subscription);
        return {
          id: entity.id,
          userId: entity.userId,
          status: entity.status,
          planName: entity.plan?.name ?? '',
          currentPeriodEnd: entity.currentPeriodEnd,
          readingAccessState: resolveReadingAccessState(entity),
          stripeCustomerId: entity.stripeCustomerId,
          stripeSubscriptionId: entity.stripeSubscriptionId,
        };
      });
    }
    if (resource === 'invitations') {
      const rows = await this.prismaProviderService.adminInvitation.findMany({
        where: { id: { in: [...ids] }, deletedAt: null },
      });
      return rows.map((invitation) => ({ ...invitation }));
    }
    const rows = await this.prismaProviderService.auditLog.findMany({
      where: { id: { in: [...ids] }, deletedAt: null },
    });
    return rows.map((entry) => ({ ...entry }));
  }
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) ? value : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function readNumberList(value: unknown): number[] | undefined {
  if (typeof value === 'number') {
    return [value];
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const numbers: number[] = value.filter(
    (entry: unknown): entry is number => typeof entry === 'number' && Number.isInteger(entry),
  );
  return numbers.length === 0 ? undefined : numbers;
}

function readEnum<TEnum extends Record<string, string>>(
  value: unknown,
  enumObject: TEnum,
): TEnum[keyof TEnum] | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const match: string | undefined = Object.values(enumObject).find((entry) => entry === value);
  return match as TEnum[keyof TEnum] | undefined;
}

function readEnumList<TEnum extends Record<string, string>>(
  value: unknown,
  enumObject: TEnum,
): TEnum[keyof TEnum][] | undefined {
  const values: unknown[] = Array.isArray(value) ? value : [value];
  const matched: TEnum[keyof TEnum][] = values.flatMap((entry: unknown) => {
    const parsed = readEnum(entry, enumObject);
    return parsed === undefined ? [] : [parsed];
  });
  return matched.length === 0 ? undefined : matched;
}
