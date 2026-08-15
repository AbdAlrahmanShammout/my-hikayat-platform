import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionMapper } from '@/modules/reading/mapper/reading-session.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingSessionPrismaRepository } from './reading-session-prisma.repository';

describe('ReadingSessionPrismaRepository', () => {
  const startedAt = new Date('2026-01-01T01:00:00.000Z');
  const persistenceRow = {
    id: 9,
    createdAt: startedAt,
    updatedAt: startedAt,
    deletedAt: null,
    userId: 4,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    startedAt,
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
  };
  let mockPrismaProviderService: {
    readingSession: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let readingSessionPrismaRepository: ReadingSessionPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      readingSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    readingSessionPrismaRepository = new ReadingSessionPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a reading session and maps the persistence payload', async () => {
    mockPrismaProviderService.readingSession.create.mockResolvedValue(persistenceRow);
    const actualEntity = await readingSessionPrismaRepository.create({
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      startedAt,
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      spineIndex: 1,
      scrollOffset: 120,
      spreadIndex: null,
      pageNumber: null,
    });
    expect(mockPrismaProviderService.readingSession.create).toHaveBeenCalled();
    expect(actualEntity).toEqual(ReadingSessionMapper.toEntity(persistenceRow));
  });

  it('returns null when findOpenByUserIdAndBookId misses an open session', async () => {
    mockPrismaProviderService.readingSession.findFirst.mockResolvedValue(null);
    const actualEntity = await readingSessionPrismaRepository.findOpenByUserIdAndBookId(4, 8);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.readingSession.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 4, bookId: 8, endedAt: null, deletedAt: null },
      }),
    );
  });
});
