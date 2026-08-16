import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookType } from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin collections (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `admin-collection-owner-${Date.now()}@book.test`;
  const adminEmail = `admin-collection-admin-${Date.now()}@book.test`;
  const emails = [ownerEmail, adminEmail];
  const slugSuffix = `${Date.now()}`;
  let app: INestApplication | undefined;
  let ownerAccessToken: string | undefined;
  let adminAccessToken: string | undefined;
  let firstBookId: number | undefined;
  let secondBookId: number | undefined;
  let thirdBookId: number | undefined;
  let collectionId: number | undefined;

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
      where: { owner: { email: { in: emails } } },
    });
    await prismaProviderService.category.deleteMany({
      where: { slug: `admin-collection-${slugSuffix}` },
    });
    await deleteUsersByEmail(prismaProviderService, emails);
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

  function getOwnerAccessToken(): string {
    if (ownerAccessToken === undefined) {
      throw new Error('Owner access token was not created');
    }
    return ownerAccessToken;
  }

  function getAdminAccessToken(): string {
    if (adminAccessToken === undefined) {
      throw new Error('Admin access token was not created');
    }
    return adminAccessToken;
  }

  function getFirstBookId(): number {
    if (firstBookId === undefined) {
      throw new Error('First book was not created');
    }
    return firstBookId;
  }

  function getSecondBookId(): number {
    if (secondBookId === undefined) {
      throw new Error('Second book was not created');
    }
    return secondBookId;
  }

  function getThirdBookId(): number {
    if (thirdBookId === undefined) {
      throw new Error('Third book was not created');
    }
    return thirdBookId;
  }

  function getCollectionId(): number {
    if (collectionId === undefined) {
      throw new Error('Collection was not created');
    }
    return collectionId;
  }

  function readCollectionItems(body: unknown): { bookId: number; displayOrder: number }[] {
    if (typeof body !== 'object' || body === null || !('items' in body)) {
      throw new Error('Collection response items were missing');
    }
    const items: unknown = body.items;
    if (!Array.isArray(items)) {
      throw new Error('Collection response items were missing');
    }
    return items as { bookId: number; displayOrder: number }[];
  }

  async function registerPublisher(
    email: string,
  ): Promise<{ userId: number; accessToken: string }> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    const accessToken = registerResponse.body.accessToken as string;
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${accessToken}`);
    return {
      userId: publisherResponse.body.user.id as number,
      accessToken,
    };
  }

  it('Given no access token, When a collection is created, Then authentication fails', async () => {
    const actualResponse = await request(getServer())
      .post('/admin/collections')
      .send({
        title: `Harbor Picks ${slugSuffix}`,
      });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given an author session, When a collection is created, Then access is denied', async () => {
    const owner = await registerPublisher(ownerEmail);
    ownerAccessToken = owner.accessToken;
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Admin Collection ${slugSuffix}`,
        slug: `admin-collection-${slugSuffix}`,
      });
    const bookService: BookService = getRunningApp().get(BookService);
    const firstBook = await bookService.createBook({
      title: 'Harbor Lights',
      description: 'Used by admin collection e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
      categoryIds: [category.id],
    });
    const secondBook = await bookService.createBook({
      title: 'Mountain Paths',
      description: 'Used by admin collection e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
      categoryIds: [category.id],
    });
    const thirdBook = await bookService.createBook({
      title: 'River Songs',
      description: 'Used by admin collection e2e tests.',
      bookType: BookType.STANDARD_CHAPTER,
      ownerId: owner.userId,
      categoryIds: [category.id],
    });
    firstBookId = firstBook.id;
    secondBookId = secondBook.id;
    thirdBookId = thirdBook.id;
    const actualResponse = await request(getServer())
      .post('/admin/collections')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({
        title: `Harbor Picks ${slugSuffix}`,
        bookIds: [getFirstBookId(), getSecondBookId()],
      });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When collections are created, edited, reordered, and deleted, Then editorial membership is persisted', async () => {
    const admin = await registerPublisher(adminEmail);
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.user.update({
      where: { id: admin.userId },
      data: { role: UserRole.ADMIN },
    });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    adminAccessToken = loginResponse.body.accessToken as string;
    const emptyTitleResponse = await request(getServer())
      .post('/admin/collections')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ title: '   ' });
    expect(emptyTitleResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(emptyTitleResponse.body.code).toBe('BAD_USER_INPUT');
    const createResponse = await request(getServer())
      .post('/admin/collections')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({
        title: `Harbor Picks ${slugSuffix}`,
        bookIds: [getFirstBookId(), getSecondBookId()],
      });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    expect(createResponse.body.title).toBe(`Harbor Picks ${slugSuffix}`);
    expect(readCollectionItems(createResponse.body).map((item) => item.bookId)).toEqual([
      getFirstBookId(),
      getSecondBookId(),
    ]);
    collectionId = createResponse.body.id as number;
    const listResponse = await request(getServer())
      .get('/admin/collections')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBeGreaterThanOrEqual(1);
    expect(listResponse.body.collections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: getCollectionId(),
          title: `Harbor Picks ${slugSuffix}`,
        }),
      ]),
    );
    const getResponse = await request(getServer())
      .get(`/admin/collections/${getCollectionId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.id).toBe(getCollectionId());
    const updateResponse = await request(getServer())
      .patch(`/admin/collections/${getCollectionId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ title: `Harbor Classics ${slugSuffix}` });
    expect(updateResponse.status).toBe(HttpStatus.OK);
    expect(updateResponse.body.title).toBe(`Harbor Classics ${slugSuffix}`);
    const addResponse = await request(getServer())
      .post(`/admin/collections/${getCollectionId()}/books`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ bookId: getThirdBookId() });
    expect(addResponse.status).toBe(HttpStatus.CREATED);
    expect(readCollectionItems(addResponse.body).map((item) => item.bookId)).toEqual([
      getFirstBookId(),
      getSecondBookId(),
      getThirdBookId(),
    ]);
    const duplicateResponse = await request(getServer())
      .post(`/admin/collections/${getCollectionId()}/books`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ bookId: getThirdBookId() });
    expect(duplicateResponse.status).toBe(HttpStatus.CONFLICT);
    expect(duplicateResponse.body.code).toBe('COLLECTION_BOOK_ALREADY_ADDED');
    const reorderResponse = await request(getServer())
      .post(`/admin/collections/${getCollectionId()}/reorder`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({
        bookIds: [getThirdBookId(), getFirstBookId(), getSecondBookId()],
      });
    expect(reorderResponse.status).toBe(HttpStatus.OK);
    expect(readCollectionItems(reorderResponse.body).map((item) => item.bookId)).toEqual([
      getThirdBookId(),
      getFirstBookId(),
      getSecondBookId(),
    ]);
    expect(readCollectionItems(reorderResponse.body).map((item) => item.displayOrder)).toEqual([
      0, 1, 2,
    ]);
    const mismatchResponse = await request(getServer())
      .post(`/admin/collections/${getCollectionId()}/reorder`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ bookIds: [getFirstBookId(), getSecondBookId()] });
    expect(mismatchResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(mismatchResponse.body.code).toBe('COLLECTION_BOOKS_MISMATCH');
    const removeResponse = await request(getServer())
      .delete(`/admin/collections/${getCollectionId()}/books/${getSecondBookId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(removeResponse.status).toBe(HttpStatus.OK);
    expect(readCollectionItems(removeResponse.body).map((item) => item.bookId)).toEqual([
      getThirdBookId(),
      getFirstBookId(),
    ]);
    const missingBookResponse = await request(getServer())
      .delete(`/admin/collections/${getCollectionId()}/books/${getSecondBookId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(missingBookResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(missingBookResponse.body.code).toBe('RESOURCE_NOT_FOUND');
    const deleteResponse = await request(getServer())
      .delete(`/admin/collections/${getCollectionId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(deleteResponse.status).toBe(HttpStatus.OK);
    expect(deleteResponse.body.id).toBe(getCollectionId());
    const missingCollectionResponse = await request(getServer())
      .get(`/admin/collections/${getCollectionId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(missingCollectionResponse.status).toBe(HttpStatus.NOT_FOUND);
    expect(missingCollectionResponse.body.code).toBe('RESOURCE_NOT_FOUND');
    const auditResponse = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(auditResponse.status).toBe(HttpStatus.OK);
    expect(auditResponse.body.total).toBe(6);
    expect(auditResponse.body.auditLogs).toEqual([
      expect.objectContaining({
        actorUserId: admin.userId,
        action: AuditAction.COLLECTION_DELETED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      }),
      expect.objectContaining({
        actorUserId: admin.userId,
        action: AuditAction.COLLECTION_BOOK_REMOVED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      }),
      expect.objectContaining({
        actorUserId: admin.userId,
        action: AuditAction.COLLECTION_REORDERED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      }),
      expect.objectContaining({
        actorUserId: admin.userId,
        action: AuditAction.COLLECTION_BOOK_ADDED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      }),
      expect.objectContaining({
        actorUserId: admin.userId,
        action: AuditAction.COLLECTION_UPDATED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      }),
      expect.objectContaining({
        actorUserId: admin.userId,
        action: AuditAction.COLLECTION_CREATED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: getCollectionId(),
      }),
    ]);
  });
});
