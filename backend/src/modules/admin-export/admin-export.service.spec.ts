import { AdminExportStatus } from '@prisma/client';

import { ValidationExceptions } from '@/common/exceptions/validation.exception';
import { AdminExportQueryService } from '@/modules/admin-export/admin-export-query.service';
import { ADMIN_EXPORT_ROW_LIMIT } from '@/modules/admin-export/admin-export.constants';
import { AdminExportService } from '@/modules/admin-export/admin-export.service';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

describe('AdminExportService', () => {
  let mockPrisma: {
    adminExport: {
      create: jest.Mock;
      updateMany: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let mockQuery: { count: jest.Mock; fetchRows: jest.Mock };
  let mockAudit: { append: jest.Mock };
  let mockStorage: { putObject: jest.Mock; getObject: jest.Mock; deleteObject: jest.Mock };
  let adminExportService: AdminExportService;

  beforeEach(() => {
    mockPrisma = {
      adminExport: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    mockPrisma.adminExport.findFirst.mockResolvedValue(null);
    mockQuery = { count: jest.fn(), fetchRows: jest.fn() };
    mockAudit = { append: jest.fn() };
    mockStorage = { putObject: jest.fn(), getObject: jest.fn(), deleteObject: jest.fn() };
    adminExportService = new AdminExportService(
      mockPrisma as unknown as PrismaProviderService,
      mockQuery as unknown as AdminExportQueryService,
      mockAudit as unknown as AuditLogService,
      mockStorage as unknown as StorageManagerService,
    );
  });

  it('reports when an estimate exceeds the row limit', async () => {
    mockQuery.count.mockResolvedValue(ADMIN_EXPORT_ROW_LIMIT + 1);
    const actualEstimate = await adminExportService.estimate({
      actorUserId: 9,
      resource: 'users',
    });
    expect(actualEstimate.exceedsLimit).toBe(true);
    expect(actualEstimate.rowCount).toBe(ADMIN_EXPORT_ROW_LIMIT + 1);
  });

  it('rejects creating an export above the row limit and writes no file', async () => {
    mockQuery.count.mockResolvedValue(ADMIN_EXPORT_ROW_LIMIT + 1);
    await expect(
      adminExportService.create({ actorUserId: 9, resource: 'books' }),
    ).rejects.toBeInstanceOf(ValidationExceptions);
    expect(mockPrisma.adminExport.create).not.toHaveBeenCalled();
    expect(mockStorage.putObject).not.toHaveBeenCalled();
  });

  it('stores a pending export and audits the request without building the file', async () => {
    mockQuery.count.mockResolvedValue(2);
    mockPrisma.adminExport.create.mockResolvedValue({
      id: 3,
      status: AdminExportStatus.pending,
    });
    const actualExport = await adminExportService.create({
      actorUserId: 9,
      resource: 'users',
      filters: { q: 'ada' },
    });
    expect(actualExport.status).toBe(AdminExportStatus.pending);
    expect(mockAudit.append).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.EXPORT_REQUESTED,
        subjectType: AuditSubjectType.ADMIN_EXPORT,
        subjectId: 3,
      }),
    );
    expect(mockStorage.putObject).not.toHaveBeenCalled();
  });

  it('returns a stale processing job to pending', async () => {
    mockPrisma.adminExport.updateMany.mockResolvedValue({ count: 1 });
    const actualCount = await adminExportService.reclaimStaleProcessing(
      new Date('2026-10-04T12:00:00.000Z'),
    );
    expect(actualCount).toBe(1);
    expect(mockPrisma.adminExport.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: AdminExportStatus.pending },
      }),
    );
  });
});
