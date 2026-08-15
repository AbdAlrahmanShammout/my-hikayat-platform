import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookLayoutType, BookType } from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { assignMonthlySubscription } from './assign-monthly-subscription';
import { createTestingApp } from './create-testing-app';

describe('Admin monetization APIs (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `admin-monetization-owner-${Date.now()}@book.test`;
  const adminEmail = `admin-monetization-admin-${Date.now()}@book.test`;
  const readerEmail = `admin-monetization-reader-${Date.now()}@book.test`;
  const emails = [ownerEmail, adminEmail, readerEmail];
  const periodStartsAt = new Date('2097-04-01T00:00:00.000Z');
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

  async function registerAdmin(): Promise<string> {
    const admin = await registerPublisher(adminEmail);
    await getRunningApp()
      .get(PrismaProviderService)
      .user.update({
        where: { id: admin.userId },
        data: { role: UserRole.ADMIN },
      });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    return loginResponse.body.accessToken as string;
  }

  it('Given no access token, When a revenue period is listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/revenue-periods');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given an admin session, When the pool is set and revenue is calculated, Then platform analytics and earnings are visible', async () => {
    const owner = await registerPublisher(ownerEmail);
    const adminToken = await registerAdmin();
    const forbiddenResponse = await request(getServer())
      .post('/admin/revenue-periods')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        startsAt: '2097-04-01T00:00:00.000Z',
        endsAt: '2097-05-01T00:00:00.000Z',
      });
    expect(forbiddenResponse.status).toBe(HttpStatus.FORBIDDEN);
    const readerRegister = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const readerId = readerRegister.body.user.id as number;
    await assignMonthlySubscription(getRunningApp(), readerId);
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    const fiction = await categoryService.createCategory({
      name: `Admin Monetization Fiction ${Date.now()}`,
      categoryWeight: 1.25,
    });
    const picture = await categoryService.createCategory({
      name: `Admin Monetization Picture ${Date.now()}`,
      categoryWeight: 1.5,
    });
    createdCategoryIds.push(fiction.id, picture.id);
    const bookService: BookService = getRunningApp().get(BookService);
    const reflowableBook = await bookService.createBook({
      title: 'Admin Monetization Reflowable',
      description: 'Used by admin monetization e2e tests.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
      categoryIds: [fiction.id],
    });
    const fixedBook = await bookService.createBook({
      title: 'Admin Monetization Picture Book',
      description: 'Used by admin monetization e2e tests.',
      layoutType: BookLayoutType.FIXED_LAYOUT,
      bookType: BookType.PICTURE_BOOK,
      ownerId: owner.userId,
      categoryIds: [picture.id],
    });
    const readingSessionService: ReadingSessionService = getRunningApp().get(ReadingSessionService);
    const inRangeStart = new Date('2097-04-15T12:00:00.000Z');
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
    const createResponse = await request(getServer())
      .post('/admin/revenue-periods')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        startsAt: '2097-04-01T00:00:00.000Z',
        endsAt: '2097-05-01T00:00:00.000Z',
      });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    const periodId = createResponse.body.id as number;
    createdPeriodIds.push(periodId);
    expect(createResponse.body.poolAmountCents).toBeNull();
    const missingPool = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/calculate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(missingPool.status).toBe(HttpStatus.BAD_REQUEST);
    const patchResponse = await request(getServer())
      .patch(`/admin/revenue-periods/${periodId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ poolAmountCents: 10000 });
    expect(patchResponse.status).toBe(HttpStatus.OK);
    expect(patchResponse.body.poolAmountCents).toBe(10000);
    const engagementsResponse = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/engagements`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(engagementsResponse.status).toBe(HttpStatus.OK);
    expect(engagementsResponse.body.totalReadingMinutes).toBe(5);
    const calculateResponse = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/calculate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(calculateResponse.status).toBe(HttpStatus.OK);
    expect(calculateResponse.body.authorCents).toBe(7000);
    expect(calculateResponse.body.platformCutCents).toBe(3000);
    expect(calculateResponse.body.total).toBe(2);
    const earningsResponse = await request(getServer())
      .get(`/admin/revenue-periods/${periodId}/earnings`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(earningsResponse.status).toBe(HttpStatus.OK);
    expect(earningsResponse.body.authorCents).toBe(7000);
    expect(earningsResponse.body.platformCutCents).toBe(3000);
    const analyticsResponse = await request(getServer())
      .get(`/admin/revenue-periods/${periodId}/analytics`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(analyticsResponse.status).toBe(HttpStatus.OK);
    expect(analyticsResponse.body.totalReadingMinutes).toBe(5);
    const heatmapResponse = await request(getServer())
      .get(`/admin/revenue-periods/${periodId}/books/${fixedBook.id}/heatmap`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(heatmapResponse.status).toBe(HttpStatus.OK);
    expect(heatmapResponse.body.spreads).toEqual([
      { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
    ]);
    const closeResponse = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/close`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(closeResponse.status).toBe(HttpStatus.OK);
    expect(closeResponse.body.status).toBe(RevenuePeriodStatus.CLOSED);
  });
});
