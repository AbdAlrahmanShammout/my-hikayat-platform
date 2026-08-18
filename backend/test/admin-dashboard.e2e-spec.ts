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

describe('Admin dashboard summary (e2e)', () => {
  const password = 'correct-horse-battery';
  const adminEmail = `admin-dashboard-admin-${Date.now()}@book.test`;
  const authorEmail = `admin-dashboard-author-${Date.now()}@book.test`;
  const readerEmail = `admin-dashboard-reader-${Date.now()}@book.test`;
  const extraReaderEmail = `admin-dashboard-extra-reader-${Date.now()}@book.test`;
  const emails = [adminEmail, authorEmail, readerEmail, extraReaderEmail];
  const periodStartsAt = new Date('2099-06-01T00:00:00.000Z');
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

  it('Given no access token, When the admin dashboard summary is requested, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/dashboard/summary');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given an author session, When the admin dashboard summary is requested, Then access is denied', async () => {
    const author = await registerPublisher(authorEmail);
    const actualResponse = await request(getServer())
      .get('/admin/dashboard/summary')
      .set('Authorization', `Bearer ${author.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given a reader session, When the admin dashboard summary is requested, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .get('/admin/dashboard/summary')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given seeded platform data, When an admin requests the summary, Then KPIs follow catalog visibility, isPublisher, and the analytics minute formula', async () => {
    const admin = await registerAdmin();
    const baselineResponse = await request(getServer())
      .get('/admin/dashboard/summary')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(baselineResponse.status).toBe(HttpStatus.OK);
    const extraReader = await request(getServer()).post('/auth/register').send({
      email: extraReaderEmail,
      password,
    });
    const extraReaderId = extraReader.body.user.id as number;
    const bookService: BookService = getRunningApp().get(BookService);
    const reviewBook = await bookService.createBook({
      title: 'Admin Dashboard In Review',
      description: 'Pending review KPI.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: admin.userId,
    });
    const publishedBook = await bookService.createBook({
      title: 'Admin Dashboard Catalog Visible',
      description: 'Catalog-visible KPI.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: admin.userId,
    });
    const approvedUnpublishedBook = await bookService.createBook({
      title: 'Admin Dashboard Approved Unpublished',
      description: 'Must not count as published.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: admin.userId,
    });
    const deletedBook = await bookService.createBook({
      title: 'Admin Dashboard Deleted',
      description: 'Soft-deleted and excluded.',
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
      where: { id: deletedBook.id },
      data: { deletedAt: new Date('2026-08-01T00:00:00.000Z') },
    });
    const revenuePeriodService: RevenuePeriodService = getRunningApp().get(RevenuePeriodService);
    const period = await revenuePeriodService.createRevenuePeriod({
      startsAt: periodStartsAt,
      endsAt: new Date('2099-07-01T00:00:00.000Z'),
    });
    createdPeriodIds.push(period.id);
    await prismaProviderService.bookEngagement.create({
      data: {
        revenuePeriodId: period.id,
        bookId: publishedBook.id,
        layoutType: BookLayoutType.REFLOWABLE,
        activeReadingMs: 90_000,
        activeSpreadMs: 0,
        visualSceneTimeMs: 45_000,
        categoryWeight: 1,
        weightedEngagement: 1.5,
      },
    });
    const seededResponse = await request(getServer())
      .get('/admin/dashboard/summary')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(seededResponse.status).toBe(HttpStatus.OK);
    expect(seededResponse.body.totalUsers).toBe(baselineResponse.body.totalUsers + 1);
    expect(seededResponse.body.totalPublishers).toBe(baselineResponse.body.totalPublishers);
    expect(seededResponse.body.totalBooks).toBe(baselineResponse.body.totalBooks + 3);
    expect(seededResponse.body.publishedBooks).toBe(baselineResponse.body.publishedBooks + 1);
    expect(seededResponse.body.pendingReviewBooks).toBe(
      baselineResponse.body.pendingReviewBooks + 1,
    );
    expect(seededResponse.body.totalReadingMinutes).toBe(
      baselineResponse.body.totalReadingMinutes + 1.5,
    );
    await prismaProviderService.user.update({
      where: { id: extraReaderId },
      data: { deletedAt: new Date('2026-08-01T00:00:00.000Z') },
    });
    const afterDeleteResponse = await request(getServer())
      .get('/admin/dashboard/summary')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(afterDeleteResponse.body.totalUsers).toBe(baselineResponse.body.totalUsers);
    expect(afterDeleteResponse.body.totalPublishers).toBe(seededResponse.body.totalPublishers);
  });
});
