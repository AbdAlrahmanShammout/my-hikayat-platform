import { OfflineDownloadMapper } from '@/modules/offline-download/mapper/offline-download.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { OfflineDownloadPrismaRepository } from './offline-download-prisma.repository';

describe('OfflineDownloadPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 4,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    userId: 9,
    bookId: 12,
  };
  let mockPrismaProviderService: {
    offlineDownload: {
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let offlineDownloadPrismaRepository: OfflineDownloadPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      offlineDownload: {
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    offlineDownloadPrismaRepository = new OfflineDownloadPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('returns null when the user has no slot for the book', async () => {
    mockPrismaProviderService.offlineDownload.findFirst.mockResolvedValue(null);
    const actualEntity = await offlineDownloadPrismaRepository.findByUserIdAndBookId({
      userId: 9,
      bookId: 12,
    });
    expect(actualEntity).toBeNull();
  });

  it('counts active slots for a user', async () => {
    mockPrismaProviderService.offlineDownload.count.mockResolvedValue(2);
    const actualCount = await offlineDownloadPrismaRepository.countActiveByUserId(9);
    expect(mockPrismaProviderService.offlineDownload.count).toHaveBeenCalledWith({
      where: { userId: 9, deletedAt: null },
    });
    expect(actualCount).toBe(2);
  });

  it('creates a slot', async () => {
    mockPrismaProviderService.offlineDownload.create.mockResolvedValue(persistenceRow);
    const actualEntity = await offlineDownloadPrismaRepository.create({
      userId: 9,
      bookId: 12,
    });
    expect(actualEntity).toEqual(OfflineDownloadMapper.toEntity(persistenceRow));
  });

  it('restores a released slot', async () => {
    mockPrismaProviderService.offlineDownload.update.mockResolvedValue(persistenceRow);
    const actualEntity = await offlineDownloadPrismaRepository.restore({ id: 4 });
    expect(mockPrismaProviderService.offlineDownload.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { deletedAt: null },
    });
    expect(actualEntity.deletedAt).toBeNull();
  });
});
