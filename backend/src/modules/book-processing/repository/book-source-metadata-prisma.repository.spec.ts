import { BookSourceMetadataMapper } from '@/modules/book-processing/mapper/book-source-metadata.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookSourceMetadataPrismaRepository } from './book-source-metadata-prisma.repository';

describe('BookSourceMetadataPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 3,
    createdAt,
    updatedAt,
    deletedAt: null,
    bookId: 8,
    packagePath: 'OEBPS/content.opf',
    epubVersion: '3.0',
    identifier: 'urn:uuid:test',
    title: 'The Last Lighthouse',
    language: 'en',
    creator: 'Jane Author',
    publisher: null,
    description: null,
  };
  let mockPrismaProviderService: {
    bookSourceMetadata: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let bookSourceMetadataPrismaRepository: BookSourceMetadataPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      bookSourceMetadata: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    bookSourceMetadataPrismaRepository = new BookSourceMetadataPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates metadata linked to a book and maps the persistence payload', async () => {
    mockPrismaProviderService.bookSourceMetadata.create.mockResolvedValue(persistenceRow);
    const actualEntity = await bookSourceMetadataPrismaRepository.create({
      bookId: 8,
      packagePath: 'OEBPS/content.opf',
      epubVersion: '3.0',
      identifier: 'urn:uuid:test',
      title: 'The Last Lighthouse',
      language: 'en',
      creator: 'Jane Author',
      publisher: null,
      description: null,
    });
    expect(mockPrismaProviderService.bookSourceMetadata.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          book: { connect: { id: 8 } },
          title: 'The Last Lighthouse',
          epubVersion: '3.0',
        }),
      }),
    );
    expect(actualEntity).toEqual(BookSourceMetadataMapper.toEntity(persistenceRow));
  });

  it('returns null when findByBookId misses operational metadata', async () => {
    mockPrismaProviderService.bookSourceMetadata.findFirst.mockResolvedValue(null);
    const actualEntity = await bookSourceMetadataPrismaRepository.findByBookId(8);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.bookSourceMetadata.findFirst).toHaveBeenCalledWith({
      where: { bookId: 8, deletedAt: null },
    });
  });
});
