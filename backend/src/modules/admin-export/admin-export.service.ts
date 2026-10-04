import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdminExport, AdminExportStatus, Prisma } from '@prisma/client';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { ValidationExceptions } from '@/common/exceptions/validation.exception';
import { toCsvDocument } from '@/modules/admin-export/admin-export-csv.helper';
import {
  AdminExportSnapshot,
  AdminExportQueryService,
} from '@/modules/admin-export/admin-export-query.service';
import {
  ADMIN_EXPORT_DEFAULT_COLUMNS,
  ADMIN_EXPORT_RESOURCES,
  ADMIN_EXPORT_RETENTION_MS,
  ADMIN_EXPORT_ROW_LIMIT,
  ADMIN_EXPORT_STALE_PROCESSING_MS,
  AdminExportResource,
  listAllowedExportColumns,
} from '@/modules/admin-export/admin-export.constants';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

export type CreateAdminExportInput = {
  readonly actorUserId: number;
  readonly resource: string;
  readonly filters?: Record<string, unknown>;
  readonly columns?: readonly string[];
  readonly selectedIds?: readonly number[];
  readonly sortBy?: string;
  readonly sortOrder?: AdminUserSortOrder;
};

export type AdminExportEstimate = {
  readonly resource: AdminExportResource;
  readonly rowCount: number;
  readonly allowedColumns: readonly string[];
  readonly exceedsLimit: boolean;
};

@Injectable()
export class AdminExportService implements OnModuleInit {
  private isDraining = false;

  constructor(
    private readonly prismaProviderService: PrismaProviderService,
    private readonly adminExportQueryService: AdminExportQueryService,
    private readonly auditLogService: AuditLogService,
    private readonly storageManagerService: StorageManagerService,
  ) {}

  onModuleInit(): void {
    void this.reclaimStaleProcessing().then(() => this.drainQueue());
  }

  async estimate(input: CreateAdminExportInput): Promise<AdminExportEstimate> {
    const snapshot: AdminExportSnapshot = this.toSnapshot(input);
    const rowCount: number = await this.adminExportQueryService.count(snapshot);
    return {
      resource: snapshot.resource,
      rowCount,
      allowedColumns: listAllowedExportColumns(snapshot.resource),
      exceedsLimit: rowCount > ADMIN_EXPORT_ROW_LIMIT,
    };
  }

  async create(input: CreateAdminExportInput): Promise<AdminExport> {
    const snapshot: AdminExportSnapshot = this.toSnapshot(input);
    const rowCount: number = await this.adminExportQueryService.count(snapshot);
    if (rowCount > ADMIN_EXPORT_ROW_LIMIT) {
      throw new ValidationExceptions({
        message: `Export is limited to ${ADMIN_EXPORT_ROW_LIMIT} rows`,
        code: 'EXPORT_LIMIT_EXCEEDED',
        validationErrorObjects: [
          { property: 'resource', constraints: { max: `At most ${ADMIN_EXPORT_ROW_LIMIT} rows` } },
        ],
      });
    }
    const created: AdminExport = await this.prismaProviderService.adminExport.create({
      data: {
        actorUserId: input.actorUserId,
        resource: snapshot.resource,
        filters: snapshot.filters as Prisma.InputJsonValue,
        columns: [...(input.columns ?? ADMIN_EXPORT_DEFAULT_COLUMNS[snapshot.resource])],
        selectedIds: snapshot.selectedIds === null ? undefined : [...snapshot.selectedIds],
        sortBy: snapshot.sortBy,
        sortOrder: snapshot.sortOrder,
        status: AdminExportStatus.pending,
      },
    });
    await this.auditLogService.append({
      actorUserId: input.actorUserId,
      action: AuditAction.EXPORT_REQUESTED,
      subjectType: AuditSubjectType.ADMIN_EXPORT,
      subjectId: created.id,
      metadata: { resource: snapshot.resource, rowCount },
    });
    setImmediate(() => {
      void this.drainQueue();
    });
    return created;
  }

  async list(input: { readonly limit?: number; readonly offset?: number }): Promise<{
    readonly items: AdminExport[];
    readonly total: number;
  }> {
    await this.expireReadyExports();
    const where: Prisma.AdminExportWhereInput = { deletedAt: null };
    const [items, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.adminExport.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: input.limit ?? DEFAULT_PAGE_SIZE,
        skip: input.offset ?? DEFAULT_PAGE_OFFSET,
      }),
      this.prismaProviderService.adminExport.count({ where }),
    ]);
    return { items, total };
  }

  async getById(id: number): Promise<AdminExport> {
    await this.expireReadyExports(id);
    const row: AdminExport | null = await this.prismaProviderService.adminExport.findFirst({
      where: { id, deletedAt: null },
    });
    if (row === null) {
      throw new ResourceNotFoundException('Admin export', id);
    }
    return row;
  }

  async download(id: number): Promise<{ readonly fileName: string; readonly body: Buffer }> {
    const row: AdminExport = await this.getById(id);
    if (row.status !== AdminExportStatus.ready || row.storageKey === null) {
      throw new ResourceConflictException({
        message: 'Export file is not ready',
        code: 'EXPORT_NOT_READY',
      });
    }
    const object = await this.storageManagerService.getObject({ key: row.storageKey });
    return { fileName: `${row.resource}-${row.id}.csv`, body: object.body };
  }

  async reclaimStaleProcessing(now: Date = new Date()): Promise<number> {
    const cutoff = new Date(now.getTime() - ADMIN_EXPORT_STALE_PROCESSING_MS);
    const result = await this.prismaProviderService.adminExport.updateMany({
      where: {
        status: AdminExportStatus.processing,
        updatedAt: { lt: cutoff },
        deletedAt: null,
      },
      data: { status: AdminExportStatus.pending },
    });
    return result.count;
  }

  private async drainQueue(): Promise<void> {
    if (this.isDraining) {
      return;
    }
    this.isDraining = true;
    try {
      let claimed: AdminExport | null = await this.claimNextPending();
      while (claimed !== null) {
        await this.processClaimed(claimed);
        claimed = await this.claimNextPending();
      }
    } finally {
      this.isDraining = false;
    }
  }

  private async claimNextPending(): Promise<AdminExport | null> {
    const next: AdminExport | null = await this.prismaProviderService.adminExport.findFirst({
      where: { status: AdminExportStatus.pending, deletedAt: null },
      orderBy: { id: 'asc' },
    });
    if (next == null) {
      return null;
    }
    const claimed = await this.prismaProviderService.adminExport.updateMany({
      where: { id: next.id, status: AdminExportStatus.pending },
      data: { status: AdminExportStatus.processing },
    });
    if (claimed.count !== 1) {
      return null;
    }
    return this.prismaProviderService.adminExport.findFirst({ where: { id: next.id } });
  }

  private async processClaimed(row: AdminExport): Promise<void> {
    try {
      const snapshot: AdminExportSnapshot = this.snapshotFromRow(row);
      const columns: string[] = readStringArray(row.columns);
      const rows: Record<string, unknown>[] = [];
      let offset = 0;
      let page: Record<string, unknown>[] = await this.adminExportQueryService.fetchRows(
        snapshot,
        offset,
      );
      while (page.length > 0 && rows.length < ADMIN_EXPORT_ROW_LIMIT) {
        rows.push(...page);
        offset += page.length;
        if (page.length < 500 || rows.length >= ADMIN_EXPORT_ROW_LIMIT) {
          break;
        }
        page = await this.adminExportQueryService.fetchRows(snapshot, offset);
      }
      const csv: string = toCsvDocument(columns, rows.slice(0, ADMIN_EXPORT_ROW_LIMIT));
      const storageKey = `admin-exports/${row.id}.csv`;
      await this.storageManagerService.putObject({
        key: storageKey,
        body: Buffer.from(csv, 'utf8'),
        contentType: 'text/csv',
      });
      await this.prismaProviderService.adminExport.update({
        where: { id: row.id },
        data: {
          status: AdminExportStatus.ready,
          storageKey,
          rowCount: Math.min(rows.length, ADMIN_EXPORT_ROW_LIMIT),
          expiresAt: new Date(Date.now() + ADMIN_EXPORT_RETENTION_MS),
          errorCode: null,
        },
      });
    } catch {
      await this.prismaProviderService.adminExport.update({
        where: { id: row.id },
        data: { status: AdminExportStatus.failed, errorCode: 'EXPORT_FAILED' },
      });
    }
  }

  private async expireReadyExports(id?: number): Promise<void> {
    const ready: AdminExport[] = await this.prismaProviderService.adminExport.findMany({
      where: {
        status: AdminExportStatus.ready,
        expiresAt: { lt: new Date() },
        deletedAt: null,
        ...(id === undefined ? {} : { id }),
      },
    });
    for (const row of ready) {
      if (row.storageKey !== null) {
        await this.storageManagerService.deleteObject({ key: row.storageKey });
      }
      await this.prismaProviderService.adminExport.update({
        where: { id: row.id },
        data: { status: AdminExportStatus.expired, storageKey: null },
      });
    }
  }

  private toSnapshot(input: CreateAdminExportInput): AdminExportSnapshot {
    if (!isExportResource(input.resource)) {
      throw new ValidationExceptions({
        message: 'Unknown export resource',
        code: 'BAD_USER_INPUT',
        validationErrorObjects: [
          { property: 'resource', constraints: { isIn: 'Unknown resource' } },
        ],
      });
    }
    const columns: readonly string[] =
      input.columns ?? ADMIN_EXPORT_DEFAULT_COLUMNS[input.resource];
    const allowed: ReadonlySet<string> = new Set(listAllowedExportColumns(input.resource));
    const unknown: string | undefined = columns.find((column) => !allowed.has(column));
    if (unknown !== undefined) {
      throw new ValidationExceptions({
        message: 'Unknown export column',
        code: 'BAD_USER_INPUT',
        validationErrorObjects: [{ property: 'columns', constraints: { isIn: unknown } }],
      });
    }
    return {
      resource: input.resource,
      filters: input.filters ?? {},
      selectedIds: input.selectedIds === undefined ? null : [...input.selectedIds],
      sortBy: input.sortBy ?? null,
      sortOrder: input.sortOrder ?? null,
    };
  }

  private snapshotFromRow(row: AdminExport): AdminExportSnapshot {
    return {
      resource: row.resource as AdminExportResource,
      filters: isRecord(row.filters) ? row.filters : {},
      selectedIds: readNumberArray(row.selectedIds),
      sortBy: row.sortBy,
      sortOrder:
        row.sortOrder === AdminUserSortOrder.ASC || row.sortOrder === AdminUserSortOrder.DESC
          ? row.sortOrder
          : null,
    };
  }
}

function isExportResource(value: string): value is AdminExportResource {
  return (ADMIN_EXPORT_RESOURCES as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry: unknown): entry is string => typeof entry === 'string');
}

function readNumberArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter((entry: unknown): entry is number => typeof entry === 'number');
}
