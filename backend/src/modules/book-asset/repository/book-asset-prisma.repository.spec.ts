import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetMapper } from '@/modules/book-asset/mapper/book-asset.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookAssetPrismaRepository } from './book-asset-prisma.repository';

describe('BookAssetPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 9,
    createdAt,
    updatedAt,
    deletedAt: null,
    bookId: 8,
    kind: 'source' as const,
    storageKey: 'books/8/source/original.epub',
    contentType: 'application/epub+zip',
    byteSize: 1048576,
    checksumSha256: null,
    originalFileName: 'the-last-lighthouse.epub',
    sortOrder: 0,
    isEncrypted: true,
    wrappedContentKey: null,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    bookAsset: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let bookAssetPrismaRepository: BookAssetPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      bookAsset: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    bookAssetPrismaRepository = new BookAssetPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates an asset linked to a book and maps the persistence payload', async () => {
    mockPrismaProviderService.bookAsset.create.mockResolvedValue(persistenceRow);
    const actualEntity = await bookAssetPrismaRepository.create({
      bookId: 8,
      kind: BookAssetKind.SOURCE,
      storageKey: 'books/8/source/original.epub',
      contentType: 'application/epub+zip',
      byteSize: 1048576,
      checksumSha256: null,
      originalFileName: 'the-last-lighthouse.epub',
      sortOrder: 0,
      isEncrypted: true,
      wrappedContentKey: null,
    });
    expect(mockPrismaProviderService.bookAsset.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          book: { connect: { id: 8 } },
          kind: BookAssetKind.SOURCE,
          storageKey: 'books/8/source/original.epub',
          isEncrypted: true,
        }),
      }),
    );
    expect(actualEntity).toEqual(BookAssetMapper.toEntity(persistenceRow));
  });

  it('returns null when findById misses an operational asset', async () => {
    mockPrismaProviderService.bookAsset.findFirst.mockResolvedValue(null);
    const actualEntity = await bookAssetPrismaRepository.findById(9);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.bookAsset.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 9, deletedAt: null },
      }),
    );
  });

  it('lists assets for a book with a real total and optional kind filter', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await bookAssetPrismaRepository.list({
      bookId: 8,
      limit: 20,
      offset: 0,
      kind: BookAssetKind.SOURCE,
    });
    expect(mockPrismaProviderService.bookAsset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, bookId: 8, kind: BookAssetKind.SOURCE },
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([BookAssetMapper.toEntity(persistenceRow)]);
  });

  it('returns the newest operational asset for a book and kind', async () => {
    mockPrismaProviderService.bookAsset.findFirst.mockResolvedValue(persistenceRow);
    const actualEntity = await bookAssetPrismaRepository.findLatestByBookIdAndKind({
      bookId: 8,
      kind: BookAssetKind.SOURCE,
    });
    expect(mockPrismaProviderService.bookAsset.findFirst).toHaveBeenCalledWith({
      where: { bookId: 8, kind: BookAssetKind.SOURCE, deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    expect(actualEntity).toEqual(BookAssetMapper.toEntity(persistenceRow));
  });
});
