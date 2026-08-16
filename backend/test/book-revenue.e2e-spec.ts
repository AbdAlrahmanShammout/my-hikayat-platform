import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { UserService } from '@/modules/user/user.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';
import { publishTestBook } from './publish-test-book';

describe('Book revenue calculation (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `book-revenue-owner-${Date.now()}@book.test`;
  const readerEmail = `book-revenue-reader-${Date.now()}@book.test`;
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
    await prismaProviderService.bookRevenue.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
    });
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
    await prismaProviderService.revenuePeriod.deleteMany({
      where: {
        OR: [
          ...(createdPeriodIds.length > 0 ? [{ id: { in: createdPeriodIds } }] : []),
          { startsAt: new Date('2099-01-01T00:00:00.000Z') },
        ],
      },
    });
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

  it('Given weighted engagement and a pool, When revenue is calculated, Then authors receive the remainder after the snapshotted platform cut', async () => {
    const ownerRegister = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const ownerId = ownerRegister.body.user.id as number;
    const userService: UserService = getRunningApp().get(UserService);
    await userService.enablePublisherCapability({ userId: ownerId });
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    const fiction = await categoryService.createCategory({
      name: `Revenue Fiction ${Date.now()}`,
      categoryWeight: 1.25,
    });
    const picture = await categoryService.createCategory({
      name: `Revenue Picture ${Date.now()}`,
      categoryWeight: 1.5,
    });
    createdCategoryIds.push(fiction.id, picture.id);
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Revenue Reflowable',
      description: 'Used by book revenue e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
      categoryIds: [fiction.id],
    });
    const fixedBook = await bookService.createBook({
      title: 'Revenue Picture Book',
      description: 'Used by book revenue e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId,
      categoryIds: [picture.id],
    });
    await publishTestBook(getRunningApp(), reflowableBook.id);
    await publishTestBook(getRunningApp(), fixedBook.id);
    const readerRegister = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const readerId = readerRegister.body.user.id as number;
    await assignMonthlySubscription(getRunningApp(), readerId);
    const readingSessionService: ReadingSessionService = getRunningApp().get(ReadingSessionService);
    const inRangeStart = new Date('2099-01-15T12:00:00.000Z');
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
    const period = await revenuePeriodService.createRevenuePeriod({
      startsAt: new Date('2099-01-01T00:00:00.000Z'),
      endsAt: new Date('2099-02-01T00:00:00.000Z'),
      poolAmountCents: 10000,
    });
    createdPeriodIds.push(period.id);
    const bookRevenueService: BookRevenueService = getRunningApp().get(BookRevenueService);
    const calculated = await bookRevenueService.calculatePeriodRevenue({
      revenuePeriodId: period.id,
      actorUserId: ownerId,
    });
    const reflowable = calculated.find((row) => row.bookId === reflowableBook.id);
    const fixed = calculated.find((row) => row.bookId === fixedBook.id);
    expect(reflowable?.ownerId).toBe(ownerId);
    expect(reflowable?.authorCents).toBe(2500);
    expect(reflowable?.platformCutCents).toBe(1071);
    expect(reflowable?.poolShareCents).toBe(3571);
    expect(fixed?.authorCents).toBe(4500);
    expect(fixed?.platformCutCents).toBe(1929);
    expect(fixed?.poolShareCents).toBe(6429);
    const authorTotal = await bookRevenueService.sumAuthorCentsForPeriod({
      revenuePeriodId: period.id,
      ownerId,
    });
    expect(authorTotal).toBe(7000);
    expect(period.platformCutPercent).toBe(30);
  });
});
