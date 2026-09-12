import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';
import { OfflineDownloadLimitReachedException } from '@/modules/offline-download/exceptions/offline-download-limit-reached.exception';

import { OfflineDownloadService } from './offline-download.service';

function createSampleDownload(deletedAt: Date | null = null): OfflineDownloadEntity {
  return new OfflineDownloadEntity({
    id: 4,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt,
    userId: 9,
    bookId: 12,
  });
}

describe('OfflineDownloadService', () => {
  let mockOfflineDownloadRepository: {
    findByUserIdAndBookId: jest.Mock;
    countActiveByUserId: jest.Mock;
    create: jest.Mock;
    restore: jest.Mock;
    softDelete: jest.Mock;
  };
  let mockBookService: { getCatalogBookById: jest.Mock };
  let mockEntitlementService: { assertFullBookReadingAccess: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let offlineDownloadService: OfflineDownloadService;

  beforeEach(() => {
    mockOfflineDownloadRepository = {
      findByUserIdAndBookId: jest.fn(),
      countActiveByUserId: jest.fn(),
      create: jest.fn(),
      restore: jest.fn(),
      softDelete: jest.fn(),
    };
    mockBookService = { getCatalogBookById: jest.fn().mockResolvedValue({ id: 12 }) };
    mockEntitlementService = {
      assertFullBookReadingAccess: jest.fn().mockResolvedValue(undefined),
    };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: unknown) => Promise<unknown>) => work({})),
    };
    offlineDownloadService = new OfflineDownloadService(
      mockOfflineDownloadRepository,
      mockBookService,
      mockEntitlementService,
      mockTransactionRunner,
    );
  });

  describe('registerOfflineDownload', () => {
    it('returns an existing active slot without counting', async () => {
      const existing = createSampleDownload();
      mockOfflineDownloadRepository.findByUserIdAndBookId.mockResolvedValue(existing);
      const actualDownload = await offlineDownloadService.registerOfflineDownload({
        userId: 9,
        bookId: 12,
      });
      expect(mockEntitlementService.assertFullBookReadingAccess).toHaveBeenCalledWith(9);
      expect(mockOfflineDownloadRepository.countActiveByUserId).not.toHaveBeenCalled();
      expect(actualDownload).toBe(existing);
    });

    it('creates a slot when the user is under the cap', async () => {
      const created = createSampleDownload();
      mockOfflineDownloadRepository.findByUserIdAndBookId.mockResolvedValue(null);
      mockOfflineDownloadRepository.countActiveByUserId.mockResolvedValue(2);
      mockOfflineDownloadRepository.create.mockResolvedValue(created);
      const actualDownload = await offlineDownloadService.registerOfflineDownload({
        userId: 9,
        bookId: 12,
      });
      expect(mockOfflineDownloadRepository.create).toHaveBeenCalledWith(
        { userId: 9, bookId: 12 },
        {},
      );
      expect(actualDownload).toBe(created);
    });

    it('restores a previously released slot when under the cap', async () => {
      const released = createSampleDownload(new Date('2026-02-01T00:00:00.000Z'));
      const restored = createSampleDownload();
      mockOfflineDownloadRepository.findByUserIdAndBookId.mockResolvedValue(released);
      mockOfflineDownloadRepository.countActiveByUserId.mockResolvedValue(2);
      mockOfflineDownloadRepository.restore.mockResolvedValue(restored);
      const actualDownload = await offlineDownloadService.registerOfflineDownload({
        userId: 9,
        bookId: 12,
      });
      expect(mockOfflineDownloadRepository.restore).toHaveBeenCalledWith({ id: 4 }, {});
      expect(actualDownload).toBe(restored);
    });

    it('rejects a fourth distinct download', async () => {
      mockOfflineDownloadRepository.findByUserIdAndBookId.mockResolvedValue(null);
      mockOfflineDownloadRepository.countActiveByUserId.mockResolvedValue(3);
      await expect(
        offlineDownloadService.registerOfflineDownload({ userId: 9, bookId: 12 }),
      ).rejects.toBeInstanceOf(OfflineDownloadLimitReachedException);
      expect(mockOfflineDownloadRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('releaseOfflineDownload', () => {
    it('soft-deletes an active slot', async () => {
      mockOfflineDownloadRepository.findByUserIdAndBookId.mockResolvedValue(createSampleDownload());
      await offlineDownloadService.releaseOfflineDownload({ userId: 9, bookId: 12 });
      expect(mockOfflineDownloadRepository.softDelete).toHaveBeenCalledWith(4);
    });

    it('is a no-op when the slot is missing', async () => {
      mockOfflineDownloadRepository.findByUserIdAndBookId.mockResolvedValue(null);
      await offlineDownloadService.releaseOfflineDownload({ userId: 9, bookId: 12 });
      expect(mockOfflineDownloadRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
