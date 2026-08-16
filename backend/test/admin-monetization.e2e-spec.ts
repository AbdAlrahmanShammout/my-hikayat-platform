import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
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
import { deleteUsersByEmail } from './delete-users.helper';
import { publishTestBook } from './publish-test-book';

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
    await prismaProviderService.readingChapterEngagement.deleteMany({
      where: {
        OR: [{ user: { email: { in: emails } } }, { book: { owner: { email: { in: emails } } } }],
      },
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
    await prismaProviderService.bookChapter.deleteMany({
      where: { book: { owner: { email: { in: emails } } } },
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

  async function registerAdmin(): Promise<{ accessToken: string; userId: number }> {
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
    return {
      accessToken: loginResponse.body.accessToken as string,
      userId: admin.userId,
    };
  }

  it('Given no access token, When a revenue period is listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/revenue-periods');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given an admin session, When the pool is set and revenue is calculated, Then platform analytics and earnings are visible', async () => {
    const owner = await registerPublisher(ownerEmail);
    const admin = await registerAdmin();
    const adminToken = admin.accessToken;
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
    await publishTestBook(getRunningApp(), reflowableBook.id);
    await publishTestBook(getRunningApp(), fixedBook.id);
    await getRunningApp()
      .get(PrismaProviderService)
      .bookChapter.create({
        data: {
          bookId: reflowableBook.id,
          spineIndex: 0,
          href: 'OEBPS/chapter1.xhtml',
          manifestId: 'c1',
          title: 'The Harbor',
          contentText: 'First chapter text.',
        },
      });
    const readingSessionService: ReadingSessionService = getRunningApp().get(ReadingSessionService);
    const readingIntelligenceService: ReadingIntelligenceService = getRunningApp().get(
      ReadingIntelligenceService,
    );
    const inRangeStart = new Date('2097-04-15T12:00:00.000Z');
    const reflowableSession = await readingSessionService.startReadingSession({
      userId: readerId,
      bookId: reflowableBook.id,
      spineIndex: 0,
      scrollOffset: 0,
      startedAt: inRangeStart,
    });
    await readingIntelligenceService.ingestReadingActivity({
      userId: readerId,
      bookId: reflowableBook.id,
      sessionId: reflowableSession.id,
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
    const missingPoolAudit = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.REVENUE_CALCULATED,
        subjectType: AuditSubjectType.REVENUE_PERIOD,
        subjectId: periodId,
      })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(missingPoolAudit.status).toBe(HttpStatus.OK);
    expect(missingPoolAudit.body.total).toBe(0);
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
    const engagementsAudit = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.REVENUE_CALCULATED,
        subjectType: AuditSubjectType.REVENUE_PERIOD,
        subjectId: periodId,
      })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(engagementsAudit.status).toBe(HttpStatus.OK);
    expect(engagementsAudit.body.total).toBe(0);
    const calculateResponse = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/calculate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(calculateResponse.status).toBe(HttpStatus.OK);
    expect(calculateResponse.body.authorCents).toBe(7000);
    expect(calculateResponse.body.platformCutCents).toBe(3000);
    expect(calculateResponse.body.total).toBe(2);
    const recalculateResponse = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/calculate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(recalculateResponse.status).toBe(HttpStatus.OK);
    const calculateAudit = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.REVENUE_CALCULATED,
        subjectType: AuditSubjectType.REVENUE_PERIOD,
        subjectId: periodId,
      })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(calculateAudit.status).toBe(HttpStatus.OK);
    expect(calculateAudit.body.total).toBe(2);
    expect(calculateAudit.body.auditLogs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorUserId: admin.userId,
          action: AuditAction.REVENUE_CALCULATED,
          subjectType: AuditSubjectType.REVENUE_PERIOD,
          subjectId: periodId,
        }),
      ]),
    );
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
    await readingIntelligenceService.ingestReadingActivity({
      userId: readerId,
      bookId: reflowableBook.id,
      sessionId: reflowableSession.id,
      activeDurationMs: 8000,
      idleDurationMs: 0,
      spineIndex: 99,
      scrollOffset: 0,
    });
    const heatmapResponse = await request(getServer())
      .get(`/admin/revenue-periods/${periodId}/books/${fixedBook.id}/heatmap`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(heatmapResponse.status).toBe(HttpStatus.OK);
    expect(heatmapResponse.body).toEqual({
      bookId: fixedBook.id,
      revenuePeriodId: periodId,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreads: [
        { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
      ],
      chapters: [],
    });
    const chapterHeatmapResponse = await request(getServer())
      .get(`/admin/revenue-periods/${periodId}/books/${reflowableBook.id}/heatmap`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(chapterHeatmapResponse.status).toBe(HttpStatus.OK);
    expect(chapterHeatmapResponse.body).toEqual({
      bookId: reflowableBook.id,
      revenuePeriodId: periodId,
      layoutType: BookLayoutType.REFLOWABLE,
      spreads: [],
      chapters: [
        { spineIndex: 0, title: 'The Harbor', activeDurationMs: 120000 },
        { spineIndex: 99, title: null, activeDurationMs: 8000 },
      ],
    });
    const closeResponse = await request(getServer())
      .post(`/admin/revenue-periods/${periodId}/close`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(closeResponse.status).toBe(HttpStatus.OK);
    expect(closeResponse.body.status).toBe(RevenuePeriodStatus.CLOSED);
    const closeAudit = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.REVENUE_CALCULATED,
        subjectType: AuditSubjectType.REVENUE_PERIOD,
        subjectId: periodId,
      })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(closeAudit.status).toBe(HttpStatus.OK);
    expect(closeAudit.body.total).toBe(2);
  });
});
