import { HttpStatus } from '@nestjs/common';
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
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';

describe('Author monetization APIs (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `author-analytics-owner-${Date.now()}@book.test`;
  const otherEmail = `author-analytics-other-${Date.now()}@book.test`;
  const readerEmail = `author-analytics-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, otherEmail, readerEmail];
  const periodStartsAt = new Date('2098-06-01T00:00:00.000Z');
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
    await prismaProviderService.user.deleteMany({ where: { email: { in: emails } } });
    await prismaProviderService.revenuePeriod.deleteMany({
      where: {
        OR: [
          ...(createdPeriodIds.length > 0 ? [{ id: { in: createdPeriodIds } }] : []),
          { startsAt: periodStartsAt },
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

  async function registerPublisher(
    email: string,
  ): Promise<{ accessToken: string; userId: number }> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    return {
      accessToken: publisherResponse.body.accessToken as string,
      userId: publisherResponse.body.user.id as number,
    };
  }

  it('Given no access token, When author earnings are requested, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/author/earnings').query({
      revenuePeriodId: 1,
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given calculated period revenue, When the owner requests analytics, Then earnings and reading totals are scoped to that author', async () => {
    const owner = await registerPublisher(ownerEmail);
    const otherAuthor = await registerPublisher(otherEmail);
    const readerRegister = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const readerId = readerRegister.body.user.id as number;
    const readerToken = readerRegister.body.accessToken as string;
    await assignMonthlySubscription(getRunningApp(), readerId);
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    const fiction = await categoryService.createCategory({
      name: `Author Analytics Fiction ${Date.now()}`,
      categoryWeight: 1.25,
    });
    const picture = await categoryService.createCategory({
      name: `Author Analytics Picture ${Date.now()}`,
      categoryWeight: 1.5,
    });
    createdCategoryIds.push(fiction.id, picture.id);
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Author Analytics Reflowable',
      description: 'Used by author analytics e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
      categoryIds: [fiction.id],
    });
    const fixedBook = await bookService.createBook({
      title: 'Author Analytics Picture Book',
      description: 'Used by author analytics e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId: owner.userId,
      categoryIds: [picture.id],
    });
    const readingSessionService: ReadingSessionService = getRunningApp().get(ReadingSessionService);
    const inRangeStart = new Date('2098-06-15T12:00:00.000Z');
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
      startsAt: periodStartsAt,
      endsAt: new Date('2098-07-01T00:00:00.000Z'),
      poolAmountCents: 10000,
    });
    createdPeriodIds.push(period.id);
    await getRunningApp()
      .get(BookRevenueService)
      .calculatePeriodRevenue({ revenuePeriodId: period.id });
    const forbiddenResponse = await request(getServer())
      .get('/author/earnings')
      .query({ revenuePeriodId: period.id })
      .set('Authorization', `Bearer ${readerToken}`);
    expect(forbiddenResponse.status).toBe(HttpStatus.FORBIDDEN);
    const earningsResponse = await request(getServer())
      .get('/author/earnings')
      .query({ revenuePeriodId: period.id })
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(earningsResponse.status).toBe(HttpStatus.OK);
    expect(earningsResponse.body.authorCents).toBe(7000);
    expect(earningsResponse.body.total).toBe(2);
    const analyticsResponse = await request(getServer())
      .get('/author/analytics')
      .query({ revenuePeriodId: period.id })
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(analyticsResponse.status).toBe(HttpStatus.OK);
    expect(analyticsResponse.body.totalReadingMinutes).toBe(5);
    expect(analyticsResponse.body.bookEngagements[0].bookId).toBe(fixedBook.id);
    const heatmapResponse = await request(getServer())
      .get(`/author/analytics/books/${fixedBook.id}/heatmap`)
      .query({ revenuePeriodId: period.id })
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(heatmapResponse.status).toBe(HttpStatus.OK);
    expect(heatmapResponse.body.spreads).toEqual([
      { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
    ]);
    const hiddenHeatmap = await request(getServer())
      .get(`/author/analytics/books/${fixedBook.id}/heatmap`)
      .query({ revenuePeriodId: period.id })
      .set('Authorization', `Bearer ${otherAuthor.accessToken}`);
    expect(hiddenHeatmap.status).toBe(HttpStatus.NOT_FOUND);
    const otherEarnings = await request(getServer())
      .get('/author/earnings')
      .query({ revenuePeriodId: period.id })
      .set('Authorization', `Bearer ${otherAuthor.accessToken}`);
    expect(otherEarnings.status).toBe(HttpStatus.OK);
    expect(otherEarnings.body.authorCents).toBe(0);
    expect(otherEarnings.body.total).toBe(0);
    const trendResponse = await request(getServer())
      .get('/author/earnings/trend')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(trendResponse.status).toBe(HttpStatus.OK);
    const periodPoint = (
      trendResponse.body.points as { revenuePeriodId: number; authorCents: number }[]
    ).find((point) => point.revenuePeriodId === period.id);
    expect(periodPoint?.authorCents).toBe(7000);
  });
});
