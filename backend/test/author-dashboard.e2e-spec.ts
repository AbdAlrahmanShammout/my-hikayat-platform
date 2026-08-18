import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Author dashboard summary (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `author-dashboard-owner-${Date.now()}@book.test`;
  const otherEmail = `author-dashboard-other-${Date.now()}@book.test`;
  const readerEmail = `author-dashboard-reader-${Date.now()}@book.test`;
  const adminEmail = `author-dashboard-admin-${Date.now()}@book.test`;
  const emptyEmail = `author-dashboard-empty-${Date.now()}@book.test`;
  const emails = [ownerEmail, otherEmail, readerEmail, adminEmail, emptyEmail];
  const periodStartsAt = new Date('2099-03-01T00:00:00.000Z');
  const secondPeriodStartsAt = new Date('2099-04-01T00:00:00.000Z');
  let app: INestApplication | undefined;
  const createdPeriodIds: number[] = [];

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
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: { in: emails } } },
    });
    await deleteUsersByEmail(prismaProviderService, emails);
    await prismaProviderService.revenuePeriod.deleteMany({
      where: {
        OR: [
          ...(createdPeriodIds.length > 0 ? [{ id: { in: createdPeriodIds } }] : []),
          { startsAt: { in: [periodStartsAt, secondPeriodStartsAt] } },
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

  it('Given no access token, When the author dashboard summary is requested, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/author/dashboard/summary');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a reader session, When the author dashboard summary is requested, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .get('/author/dashboard/summary')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given a publisher with no books, When the author dashboard summary is requested, Then every field is zero', async () => {
    const owner = await registerPublisher(emptyEmail);
    const actualResponse = await request(getServer())
      .get('/author/dashboard/summary')
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body).toEqual({
      totalBooks: 0,
      publishedBooks: 0,
      pendingReviewBooks: 0,
      totalReadingMinutes: 0,
      authorCents: 0,
    });
  });

  it('Given owned and foreign books, When the owner requests the summary, Then KPIs stay scoped to the principal', async () => {
    const owner = await registerPublisher(ownerEmail);
    const otherAuthor = await registerPublisher(otherEmail);
    const admin = await registerPublisher(adminEmail);
    await getRunningApp()
      .get(PrismaProviderService)
      .user.update({
        where: { id: admin.userId },
        data: { role: UserRole.ADMIN },
      });
    const adminLogin = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    const bookService: BookService = getRunningApp().get(BookService);
    const pendingBook = await bookService.createBook({
      title: 'Owner Pending',
      description: 'Not in review.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    const reviewBook = await bookService.createBook({
      title: 'Owner In Review',
      description: 'Pending review KPI.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    const publishedBook = await bookService.createBook({
      title: 'Owner Catalog Visible',
      description: 'Catalog-visible KPI.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    const approvedUnpublishedBook = await bookService.createBook({
      title: 'Owner Approved Unpublished',
      description: 'Must not count as published.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    const rejectedBook = await bookService.createBook({
      title: 'Owner Rejected',
      description: 'Must not count as pending review.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    const deletedBook = await bookService.createBook({
      title: 'Owner Deleted',
      description: 'Soft-deleted and excluded.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
    });
    const otherPublishedBook = await bookService.createBook({
      title: 'Other Catalog Visible',
      description: 'Must not leak.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: otherAuthor.userId,
    });
    const adminOwnedBook = await bookService.createBook({
      title: 'Admin Owned Pending',
      description: 'Admin summary is still owner-scoped.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: admin.userId,
    });
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.book.update({
      where: { id: reviewBook.id },
      data: {
        publishingStatus: BookPublishingStatus.IN_REVIEW,
        processingStatus: BookProcessingStatus.READY,
      },
    });
    await prismaProviderService.book.update({
      where: { id: publishedBook.id },
      data: {
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: new Date('2026-01-02T00:00:00.000Z'),
        layoutType: BookLayoutType.REFLOWABLE,
      },
    });
    await prismaProviderService.book.update({
      where: { id: approvedUnpublishedBook.id },
      data: {
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: null,
      },
    });
    await prismaProviderService.book.update({
      where: { id: rejectedBook.id },
      data: {
        publishingStatus: BookPublishingStatus.REJECTED,
        processingStatus: BookProcessingStatus.READY,
      },
    });
    await prismaProviderService.book.update({
      where: { id: deletedBook.id },
      data: { deletedAt: new Date('2026-08-01T00:00:00.000Z') },
    });
    await prismaProviderService.book.update({
      where: { id: otherPublishedBook.id },
      data: {
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: new Date('2026-01-02T00:00:00.000Z'),
        layoutType: BookLayoutType.REFLOWABLE,
      },
    });
    const revenuePeriodService: RevenuePeriodService = getRunningApp().get(RevenuePeriodService);
    const firstPeriod = await revenuePeriodService.createRevenuePeriod({
      startsAt: periodStartsAt,
      endsAt: new Date('2099-04-01T00:00:00.000Z'),
    });
    const secondPeriod = await revenuePeriodService.createRevenuePeriod({
      startsAt: secondPeriodStartsAt,
      endsAt: new Date('2099-05-01T00:00:00.000Z'),
    });
    createdPeriodIds.push(firstPeriod.id, secondPeriod.id);
    await prismaProviderService.bookEngagement.createMany({
      data: [
        {
          revenuePeriodId: firstPeriod.id,
          bookId: publishedBook.id,
          layoutType: BookLayoutType.REFLOWABLE,
          activeReadingMs: 90_000,
          activeSpreadMs: 0,
          visualSceneTimeMs: 45_000,
          categoryWeight: 1,
          weightedEngagement: 1.5,
        },
        {
          revenuePeriodId: secondPeriod.id,
          bookId: publishedBook.id,
          layoutType: BookLayoutType.FIXED_LAYOUT,
          activeReadingMs: 0,
          activeSpreadMs: 180_000,
          visualSceneTimeMs: 999_000,
          categoryWeight: 1,
          weightedEngagement: 3,
        },
        {
          revenuePeriodId: firstPeriod.id,
          bookId: otherPublishedBook.id,
          layoutType: BookLayoutType.REFLOWABLE,
          activeReadingMs: 600_000,
          activeSpreadMs: 0,
          visualSceneTimeMs: 0,
          categoryWeight: 1,
          weightedEngagement: 10,
        },
        {
          revenuePeriodId: firstPeriod.id,
          bookId: deletedBook.id,
          layoutType: BookLayoutType.REFLOWABLE,
          activeReadingMs: 600_000,
          activeSpreadMs: 0,
          visualSceneTimeMs: 0,
          categoryWeight: 1,
          weightedEngagement: 10,
        },
      ],
    });
    await prismaProviderService.bookRevenue.createMany({
      data: [
        {
          revenuePeriodId: firstPeriod.id,
          bookId: publishedBook.id,
          ownerId: owner.userId,
          weightedEngagement: 1.5,
          poolShareCents: 2500,
          platformCutCents: 0,
          authorCents: 2500,
        },
        {
          revenuePeriodId: secondPeriod.id,
          bookId: publishedBook.id,
          ownerId: owner.userId,
          weightedEngagement: 3,
          poolShareCents: 4500,
          platformCutCents: 0,
          authorCents: 4500,
        },
        {
          revenuePeriodId: firstPeriod.id,
          bookId: otherPublishedBook.id,
          ownerId: otherAuthor.userId,
          weightedEngagement: 10,
          poolShareCents: 9000,
          platformCutCents: 0,
          authorCents: 9000,
        },
        {
          revenuePeriodId: firstPeriod.id,
          bookId: deletedBook.id,
          ownerId: owner.userId,
          weightedEngagement: 10,
          poolShareCents: 8000,
          platformCutCents: 0,
          authorCents: 8000,
        },
      ],
    });
    const ownerResponse = await request(getServer())
      .get('/author/dashboard/summary')
      .query({ ownerId: otherAuthor.userId })
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(ownerResponse.status).toBe(HttpStatus.OK);
    expect(ownerResponse.body).toEqual({
      totalBooks: 5,
      publishedBooks: 1,
      pendingReviewBooks: 1,
      totalReadingMinutes: 4.5,
      authorCents: 7000,
    });
    expect(pendingBook.id).toBeDefined();
    const otherResponse = await request(getServer())
      .get('/author/dashboard/summary')
      .set('Authorization', `Bearer ${otherAuthor.accessToken}`);
    expect(otherResponse.body).toEqual({
      totalBooks: 1,
      publishedBooks: 1,
      pendingReviewBooks: 0,
      totalReadingMinutes: 10,
      authorCents: 9000,
    });
    const adminResponse = await request(getServer())
      .get('/author/dashboard/summary')
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`);
    expect(adminResponse.status).toBe(HttpStatus.OK);
    expect(adminResponse.body).toEqual({
      totalBooks: 1,
      publishedBooks: 0,
      pendingReviewBooks: 0,
      totalReadingMinutes: 0,
      authorCents: 0,
    });
    expect(adminOwnedBook.ownerId).toBe(admin.userId);
  });
});
