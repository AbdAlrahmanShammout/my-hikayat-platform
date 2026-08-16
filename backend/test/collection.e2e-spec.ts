import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { CollectionService } from '@/modules/collection/collection.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Collection domain (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `collection-owner-${Date.now()}@book.test`;
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.collectionBook.deleteMany({
      where: { collection: { title: { contains: slugSuffix } } },
    });
    await prismaProviderService.collection.deleteMany({
      where: { title: { contains: slugSuffix } },
    });
    await prismaProviderService.book.deleteMany({
      where: { owner: { email: ownerEmail } },
    });
    await prismaProviderService.category.deleteMany({
      where: { slug: `collection-${slugSuffix}` },
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

  it('Given books, When a collection is created and reordered, Then editorial order is persisted', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: ownerEmail,
      password,
    });
    const ownerToken = registerResponse.body.accessToken as string;
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerId = publisherResponse.body.user.id as number;
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Collection ${slugSuffix}`,
        slug: `collection-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const firstBook = await bookService.createBook({
      title: 'Harbor Lights',
      description: 'Used by collection e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
      categoryIds: [category.id],
    });
    const secondBook = await bookService.createBook({
      title: 'Mountain Paths',
      description: 'Used by collection e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId,
      categoryIds: [category.id],
    });
    const collectionService: CollectionService = getRunningApp().get(CollectionService);
    const created = await collectionService.createCollection({
      title: `Harbor Picks ${slugSuffix}`,
      bookIds: [firstBook.id, secondBook.id],
      actorUserId: ownerId,
    });
    expect(created.items?.map((item) => item.bookId)).toEqual([firstBook.id, secondBook.id]);
    const reordered = await collectionService.reorderCollectionBooks({
      collectionId: created.id,
      bookIds: [secondBook.id, firstBook.id],
      actorUserId: ownerId,
    });
    expect(reordered.items?.map((item) => item.bookId)).toEqual([secondBook.id, firstBook.id]);
    expect(reordered.items?.map((item) => item.displayOrder)).toEqual([0, 1]);
  });
});
