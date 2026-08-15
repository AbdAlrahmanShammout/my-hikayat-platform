import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { ReadingSyncReaderController } from './reading-sync.reader.controller';
import { ReadingSyncService } from './reading-sync.service';

function createSampleReader(): UserEntity {
  return new UserEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

describe('ReadingSyncReaderController', () => {
  let readingSyncReaderController: ReadingSyncReaderController;
  let mockReadingSyncService: { getReadingSync: jest.Mock };

  beforeEach(async () => {
    mockReadingSyncService = { getReadingSync: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ReadingSyncReaderController],
      providers: [
        { provide: ReadingSyncService, useValue: mockReadingSyncService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    readingSyncReaderController = moduleRef.get(ReadingSyncReaderController);
  });

  it('maps the principal into a user-wide sync pull', async () => {
    mockReadingSyncService.getReadingSync.mockResolvedValue({
      progress: {
        entities: [
          new ReadingProgressEntity({
            id: 3,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            userId: 7,
            bookId: 8,
            layoutType: BookLayoutType.FIXED_LAYOUT,
            spineIndex: null,
            scrollOffset: null,
            spreadIndex: 1,
            pageNumber: 3,
            lastSessionAt: new Date('2026-08-15T02:00:00.000Z'),
          }),
        ],
        total: 1,
      },
      bookmarks: {
        entities: [
          new ReadingBookmarkEntity({
            id: 5,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            userId: 7,
            bookId: 8,
            layoutType: BookLayoutType.FIXED_LAYOUT,
            spineIndex: null,
            scrollOffset: null,
            spreadIndex: 1,
            pageNumber: 3,
          }),
        ],
        total: 1,
      },
    });
    const actualResponse = await readingSyncReaderController.getReadingSync(
      {},
      createSampleReader(),
    );
    expect(mockReadingSyncService.getReadingSync).toHaveBeenCalledWith({
      userId: 7,
      updatedSince: undefined,
    });
    expect(actualResponse.progressTotal).toBe(1);
    expect(actualResponse.bookmarksTotal).toBe(1);
    expect(actualResponse.progress[0].spreadIndex).toBe(1);
    expect(actualResponse.bookmarks[0].pageNumber).toBe(3);
  });

  it('maps book id, principal, and updatedSince into a book sync pull', async () => {
    const updatedSince = new Date('2026-08-15T00:00:00.000Z');
    mockReadingSyncService.getReadingSync.mockResolvedValue({
      progress: { entities: [], total: 0 },
      bookmarks: { entities: [], total: 0 },
    });
    const actualResponse = await readingSyncReaderController.getBookReadingSync(
      8,
      { updatedSince },
      createSampleReader(),
    );
    expect(mockReadingSyncService.getReadingSync).toHaveBeenCalledWith({
      userId: 7,
      bookId: 8,
      updatedSince,
    });
    expect(actualResponse.progressTotal).toBe(0);
    expect(actualResponse.bookmarksTotal).toBe(0);
  });
});
