import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookCatalogCoverService } from '@/modules/book-asset/book-catalog-cover.service';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { ReadingSessionTotalsService } from '@/modules/reading/reading-session-totals.service';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';

import { UserAdminDetailService } from './user-admin-detail.service';

function createSampleUser(): UserEntity {
  return new UserEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

function createSampleBook(id: number, layoutType: BookLayoutType): BookEntity {
  return new BookEntity({
    id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: layoutType === BookLayoutType.REFLOWABLE ? 'The Last Lighthouse' : 'Harbor Pictures',
    description: 'A book.',
    layoutType,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-03-01T00:00:00.000Z'),
    ownerId: 4,
    authorName: 'Sara Nour',
  });
}

function createReflowableProgress(): ReadingProgressEntity {
  return new ReadingProgressEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt: new Date('2026-09-08T12:00:00.000Z'),
  });
}

function createFixedLayoutProgress(): ReadingProgressEntity {
  return new ReadingProgressEntity({
    id: 4,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    bookId: 9,
    layoutType: BookLayoutType.FIXED_LAYOUT,
    spineIndex: null,
    scrollOffset: null,
    spreadIndex: 1,
    pageNumber: 3,
    lastSessionAt: new Date('2026-09-07T12:00:00.000Z'),
  });
}

function createPaidSubscription(): SubscriptionEntity {
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: 2,
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date('2026-08-01T00:00:00.000Z'),
    currentPeriodStart: new Date('2026-09-01T00:00:00.000Z'),
    currentPeriodEnd: new Date('2026-10-01T00:00:00.000Z'),
    canceledAt: null,
    activatedAt: new Date('2026-08-01T00:00:00.000Z'),
    trialStartedAt: null,
    trialEndsAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan: new PlanEntity({
      id: 2,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      slug: 'monthly',
      name: 'Monthly',
      description: 'Monthly paid',
      kind: PlanKind.MONTHLY_PAID,
      interval: PlanInterval.MONTH,
      stripePriceId: 'price_monthly',
      amountCents: 999,
      currency: 'usd',
    }),
  });
}

describe('UserAdminDetailService', () => {
  const now = new Date('2026-09-08T00:00:00.000Z');
  let mockUserService: { getUserById: jest.Mock };
  let mockSubscriptionService: { findSubscriptionByUserId: jest.Mock };
  let mockReadingProgressService: { listReadingProgresses: jest.Mock };
  let mockReadingSessionTotalsService: { sumActiveDurationByBookForUser: jest.Mock };
  let mockBookService: { listBooksByIds: jest.Mock };
  let mockBookProcessingService: {
    listChaptersByBookIds: jest.Mock;
    listPagesByBookIds: jest.Mock;
    listSpreadsByBookIds: jest.Mock;
  };
  let mockBookCatalogCoverService: { resolveCoverByBookId: jest.Mock };
  let userAdminDetailService: UserAdminDetailService;

  beforeEach(() => {
    mockUserService = { getUserById: jest.fn() };
    mockSubscriptionService = { findSubscriptionByUserId: jest.fn() };
    mockReadingProgressService = { listReadingProgresses: jest.fn() };
    mockReadingSessionTotalsService = { sumActiveDurationByBookForUser: jest.fn() };
    mockBookService = { listBooksByIds: jest.fn() };
    mockBookProcessingService = {
      listChaptersByBookIds: jest.fn(),
      listPagesByBookIds: jest.fn(),
      listSpreadsByBookIds: jest.fn(),
    };
    mockBookCatalogCoverService = { resolveCoverByBookId: jest.fn() };
    userAdminDetailService = new UserAdminDetailService(
      mockUserService as unknown as UserService,
      mockSubscriptionService as unknown as SubscriptionService,
      mockReadingProgressService as unknown as ReadingProgressService,
      mockReadingSessionTotalsService as unknown as ReadingSessionTotalsService,
      mockBookService as unknown as BookService,
      mockBookProcessingService as unknown as BookProcessingService,
      mockBookCatalogCoverService as unknown as BookCatalogCoverService,
    );
  });

  it('returns empty reading activity when the user has no progress', async () => {
    mockUserService.getUserById.mockResolvedValue(createSampleUser());
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(null);
    mockReadingProgressService.listReadingProgresses.mockResolvedValue({
      entities: [],
      total: 0,
    });
    const actualDetail = await userAdminDetailService.getAdminUserDetail(5, now);
    expect(actualDetail.user.id).toBe(5);
    expect(actualDetail.subscription).toBeNull();
    expect(actualDetail.periodProgress.remainingMs).toBeNull();
    expect(actualDetail.readingItems).toEqual([]);
    expect(mockBookService.listBooksByIds).not.toHaveBeenCalled();
  });

  it('batches reading support queries and uses content-based reflowable percent', async () => {
    mockUserService.getUserById.mockResolvedValue(createSampleUser());
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(createPaidSubscription());
    mockReadingProgressService.listReadingProgresses.mockResolvedValue({
      entities: [createReflowableProgress(), createFixedLayoutProgress()],
      total: 2,
    });
    mockBookService.listBooksByIds.mockResolvedValue([
      createSampleBook(8, BookLayoutType.REFLOWABLE),
      createSampleBook(9, BookLayoutType.FIXED_LAYOUT),
    ]);
    mockBookProcessingService.listChaptersByBookIds.mockResolvedValue([
      new BookChapterEntity({
        id: 11,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        bookId: 8,
        spineIndex: 0,
        href: 'c1',
        manifestId: 'c1',
        title: 'The Harbor',
        contentText: 'aaaa',
      }),
      new BookChapterEntity({
        id: 12,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        bookId: 8,
        spineIndex: 1,
        href: 'c2',
        manifestId: 'c2',
        title: 'The Storm',
        contentText: 'bbbb',
      }),
    ]);
    mockBookProcessingService.listPagesByBookIds.mockResolvedValue([
      createSamplePage(21, 0),
      createSamplePage(22, 1),
      createSamplePage(23, 2),
      createSamplePage(24, 3),
    ]);
    mockBookProcessingService.listSpreadsByBookIds.mockResolvedValue([]);
    mockReadingSessionTotalsService.sumActiveDurationByBookForUser.mockResolvedValue([
      { bookId: 8, activeDurationMs: 720000 },
      { bookId: 9, activeDurationMs: 0 },
    ]);
    mockBookCatalogCoverService.resolveCoverByBookId.mockResolvedValue(
      new Map([
        [8, { url: 'https://cdn.example.com/8.jpg', expiresAt: now, contentType: 'image/jpeg' }],
        [9, null],
      ]),
    );
    const actualDetail = await userAdminDetailService.getAdminUserDetail(5, now);
    expect(mockBookService.listBooksByIds).toHaveBeenCalledWith([8, 9]);
    expect(mockBookProcessingService.listChaptersByBookIds).toHaveBeenCalledWith([8]);
    expect(mockBookProcessingService.listPagesByBookIds).toHaveBeenCalledWith([9]);
    expect(actualDetail.periodProgress.elapsedPercent).toBe(23);
    expect(actualDetail.readingItems[0].contentProgressPercent).toBe(50);
    expect(actualDetail.readingItems[0].locationLabel).toBe('The Storm');
    expect(actualDetail.readingItems[0].pageNumber).toBeNull();
    expect(actualDetail.readingItems[0].activeDurationMs).toBe(720000);
    expect(actualDetail.readingItems[1].contentProgressPercent).toBe(75);
    expect(actualDetail.readingItems[1].locationLabel).toBe('Page 3 of 4');
  });
});

function createSamplePage(id: number, spineIndex: number): BookPageEntity {
  return new BookPageEntity({
    id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 9,
    spineIndex,
    href: `p${spineIndex}`,
    manifestId: `p${spineIndex}`,
    title: `Page ${spineIndex + 1}`,
    width: 1200,
    height: 1600,
    spreadRole: BookPageSpreadRole.SINGLE,
  });
}
