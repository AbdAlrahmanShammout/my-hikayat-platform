import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { UserService } from '@/modules/user/user.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Book engagement aggregation (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `book-engagement-owner-${Date.now()}@book.test`;
  const readerEmail = `book-engagement-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, readerEmail];
  let app: INestApplication | undefined;
  const createdPeriodIds: number[] = [];
  const createdCategoryIds: number[] = [];

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.bookEngagement.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
    await prismaProviderService.readingVisualEngagement.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.readingSession.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    if (createdCategoryIds.length > 0) {
      await prismaProviderService.category.deleteMany({
        where: { id: { in: createdCategoryIds } },
      });
    }
    await prismaProviderService.subscription.deleteMany({
      where: { user: { email: { in: emails } } },
    });
    await deleteUsersByEmail(prismaProviderService, emails);
    if (createdPeriodIds.length > 0) {
      await prismaProviderService.revenuePeriod.deleteMany({
        where: { id: { in: createdPeriodIds } },
      });
    }
    await app.close();
  });

  function getRunningApp(): INestApplication {
    if (!app) {
      throw new Error('Application was not initialized');
    }
    return app;
  }

  function getServer(): Server {
    return getRunningApp().getHttpServer() as Server;
  }

  it('Given reflowable and fixed-layout reading in a period, When engagement is aggregated, Then category weight is applied and idle time is ignored', async () => {
    const ownerRegister = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const ownerId = ownerRegister.body.user.id as number;
    const userService: UserService = getRunningApp().get(UserService);
    await userService.enablePublisherCapability({ userId: ownerId });
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    const fiction = await categoryService.createCategory({
      name: `Engagement Fiction ${Date.now()}`,
      categoryWeight: 1.25,
    });
    const picture = await categoryService.createCategory({
      name: `Engagement Picture ${Date.now()}`,
      categoryWeight: 1.5,
    });
    createdCategoryIds.push(fiction.id, picture.id);
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Engagement Reflowable',
      description: 'Used by book engagement e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
      categoryIds: [fiction.id],
    });
    const fixedBook = await bookService.createBook({
      title: 'Engagement Picture Book',
      description: 'Used by book engagement e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
      categoryIds: [picture.id],
    });
    const readerRegister = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const readerId = readerRegister.body.user.id as number;
    await assignMonthlySubscription(getRunningApp(), readerId);
    const readingSessionService: ReadingSessionService = getRunningApp().get(ReadingSessionService);
    const inRangeStart = new Date('2026-08-10T12:00:00.000Z');
    const outOfRangeStart = new Date('2026-07-10T12:00:00.000Z');
    const reflowableSession = await readingSessionService.startReadingSession({
      userId: readerId,
      bookId: reflowableBook.id,
      spineIndex: 0,
      scrollOffset: 0,
      startedAt: inRangeStart,
    });
    await readingSessionService.recordReadingSessionActivity({
      id: reflowableSession.id,
      userId: readerId,
      bookId: reflowableBook.id,
      activeDurationMs: 120000,
      idleDurationMs: 900000,
    });
    await readingSessionService.endReadingSession({
      id: reflowableSession.id,
      userId: readerId,
      bookId: reflowableBook.id,
      endedAt: new Date('2026-08-10T13:00:00.000Z'),
    });
    const staleSession = await readingSessionService.startReadingSession({
      userId: readerId,
      bookId: reflowableBook.id,
      spineIndex: 1,
      scrollOffset: 10,
      startedAt: outOfRangeStart,
    });
    await readingSessionService.recordReadingSessionActivity({
      id: staleSession.id,
      userId: readerId,
      bookId: reflowableBook.id,
      activeDurationMs: 600000,
      idleDurationMs: 0,
    });
    const fixedSession = await readingSessionService.startReadingSession({
      userId: readerId,
      bookId: fixedBook.id,
      spreadIndex: 0,
      pageNumber: 1,
      startedAt: inRangeStart,
    });
    const readingIntelligenceService: ReadingIntelligenceService = getRunningApp().get(
      ReadingIntelligenceService,
    );
    await readingIntelligenceService.ingestVisualEngagement({
      userId: readerId,
      bookId: fixedBook.id,
      sessionId: fixedSession.id,
      spreadIndex: 0,
      pageNumber: 1,
      activeDurationMs: 180000,
      visualSceneTimeMs: 90000,
    });
    const revenuePeriodService: RevenuePeriodService = getRunningApp().get(RevenuePeriodService);
    const period = await revenuePeriodService.ensureCurrentPeriod(
      new Date('2026-08-15T12:00:00.000Z'),
    );
    createdPeriodIds.push(period.id);
    const bookEngagementService: BookEngagementService = getRunningApp().get(BookEngagementService);
    const aggregated = await bookEngagementService.aggregatePeriodEngagement({
      revenuePeriodId: period.id,
    });
    const reflowable = aggregated.find((row) => row.bookId === reflowableBook.id);
    const fixed = aggregated.find((row) => row.bookId === fixedBook.id);
    expect(reflowable?.activeReadingMs).toBe(120000);
    expect(reflowable?.categoryWeight).toBe(1.25);
    expect(reflowable?.weightedEngagement).toBe(2.5);
    expect(fixed?.activeSpreadMs).toBe(180000);
    expect(fixed?.visualSceneTimeMs).toBe(90000);
    expect(fixed?.categoryWeight).toBe(1.5);
    expect(fixed?.weightedEngagement).toBe(4.5);
    const listed = await bookEngagementService.listBookEngagements({
      revenuePeriodId: period.id,
    });
    expect(listed.total).toBeGreaterThanOrEqual(2);
  });
});
