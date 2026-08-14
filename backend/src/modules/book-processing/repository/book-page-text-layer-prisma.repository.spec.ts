import { BookPageTextLayerMapper } from '@/modules/book-processing/mapper/book-page-text-layer.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookPageTextLayerPrismaRepository } from './book-page-text-layer-prisma.repository';

describe('BookPageTextLayerPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const runRow = {
    id: 41,
    createdAt,
    updatedAt,
    deletedAt: null,
    textLayerId: 51,
    sortOrder: 0,
    text: 'Harbor',
    x: 120,
    y: 80,
    width: 200,
    height: 24,
  };
  const layerRow = {
    id: 51,
    createdAt,
    updatedAt,
    deletedAt: null,
    pageId: 21,
    bookId: 8,
    contentText: 'Harbor lights',
    runs: [runRow],
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    bookPageTextLayer: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let bookPageTextLayerPrismaRepository: BookPageTextLayerPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      bookPageTextLayer: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      },
    };
    bookPageTextLayerPrismaRepository = new BookPageTextLayerPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('replaces text layers and runs for a book inside a repository transaction', async () => {
    mockPrismaProviderService.bookPageTextLayer.create.mockResolvedValue(layerRow);
    mockPrismaProviderService.$transaction.mockImplementation(
      async (work: (client: typeof mockPrismaProviderService) => Promise<unknown>) => {
        return work(mockPrismaProviderService);
      },
    );
    const actualEntities = await bookPageTextLayerPrismaRepository.replaceByBookId({
      bookId: 8,
      layers: [
        {
          pageId: 21,
          contentText: 'Harbor lights',
          runs: [
            {
              sortOrder: 0,
              text: 'Harbor',
              x: 120,
              y: 80,
              width: 200,
              height: 24,
            },
          ],
        },
      ],
    });
    expect(mockPrismaProviderService.bookPageTextLayer.deleteMany).toHaveBeenCalledWith({
      where: { bookId: 8 },
    });
    expect(mockPrismaProviderService.bookPageTextLayer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          book: { connect: { id: 8 } },
          page: { connect: { id: 21 } },
          contentText: 'Harbor lights',
        }),
        include: {
          runs: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
        },
      }),
    );
    expect(actualEntities).toEqual([BookPageTextLayerMapper.toEntity(layerRow)]);
  });

  it('lists operational text layers with their runs', async () => {
    mockPrismaProviderService.bookPageTextLayer.findMany.mockResolvedValue([layerRow]);
    const actualEntities = await bookPageTextLayerPrismaRepository.listByBookId(8);
    expect(mockPrismaProviderService.bookPageTextLayer.findMany).toHaveBeenCalledWith({
      where: { bookId: 8, deletedAt: null },
      include: {
        runs: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      },
      orderBy: [{ id: 'asc' }],
    });
    expect(actualEntities).toEqual([BookPageTextLayerMapper.toEntity(layerRow)]);
  });
});
