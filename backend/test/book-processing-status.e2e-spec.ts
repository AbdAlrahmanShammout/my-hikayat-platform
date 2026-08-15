import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookProcessingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookInvalidProcessingTransitionException } from '@/modules/book/exceptions/book-invalid-processing-transition.exception';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Book processing status (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `processing-owner-${Date.now()}@book.test`;
  const pdfBytes = Buffer.from('%PDF-1.4 processing');
  let app: INestApplication | undefined;
  let bookId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.bookAsset.deleteMany({
      where: { book: { owner: { email: ownerEmail } } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: ownerEmail } },
    });
    await deleteUsersByEmail(prismaProviderService, ownerEmail);
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

  function getBookId(): number {
    if (bookId === undefined) {
      throw new Error('Book was not created');
    }
    return bookId;
  }

  it('Given a new catalog book, When it is created, Then processing has not started', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    const createdBook = await getRunningApp()
      .get(BookService)
      .createBook({
        title: 'Processing Status Fixture',
        description: 'Used by processing status e2e tests.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: publisherResponse.body.user.id as number,
      });
    bookId = createdBook.id;
    expect(createdBook.processingStatus).toBe(BookProcessingStatus.NOT_STARTED);
  });

  it('Given not_started, When processing is started then completed, Then the book is ready', async () => {
    const processingStatusService = getRunningApp().get(BookProcessingStatusService);
    const processingBook = await processingStatusService.transitionProcessingStatus({
      bookId: getBookId(),
      to: BookProcessingStatus.PROCESSING,
    });
    expect(processingBook.processingStatus).toBe(BookProcessingStatus.PROCESSING);
    const readyBook = await processingStatusService.transitionProcessingStatus({
      bookId: getBookId(),
      to: BookProcessingStatus.READY,
    });
    expect(readyBook.processingStatus).toBe(BookProcessingStatus.READY);
  });

  it('Given ready, When skipping to failed, Then the transition is rejected', async () => {
    await expect(
      getRunningApp().get(BookProcessingStatusService).transitionProcessingStatus({
        bookId: getBookId(),
        to: BookProcessingStatus.FAILED,
      }),
    ).rejects.toBeInstanceOf(BookInvalidProcessingTransitionException);
  });

  it('Given a ready book, When a new source is uploaded, Then processing returns to not_started', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: ownerEmail,
      password,
    });
    const actualResponse = await request(getServer())
      .post(`/author/books/${getBookId()}/source`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', pdfBytes, { filename: 'book.pdf', contentType: 'application/pdf' });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    const actualBook = await getRunningApp().get(BookService).getBookById(getBookId());
    expect(actualBook.processingStatus).toBe(BookProcessingStatus.NOT_STARTED);
  });
});
