import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { CategoryService } from '@/modules/category/category.service';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin categories (e2e)', () => {
  const password = 'correct-horse-battery';
  const ownerEmail = `admin-category-owner-${Date.now()}@book.test`;
  const adminEmail = `admin-category-admin-${Date.now()}@book.test`;
  const emails = [ownerEmail, adminEmail];
  const slugSuffix = `${Date.now()}`;
  const categorySlug = `admin-category-${slugSuffix}`;
  const httpCreateName = `HTTP Create ${slugSuffix}`;
  const httpCreateSlug = `http-create-${slugSuffix}`;
  const httpExplicitName = `HTTP Explicit ${slugSuffix}`;
  const httpExplicitSlug = `http-explicit-${slugSuffix}`;
  let app: INestApplication | undefined;
  let ownerAccessToken: string | undefined;
  let adminAccessToken: string | undefined;
  let categoryId: number | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.category.deleteMany({
      where: { slug: { in: [categorySlug, httpCreateSlug, httpExplicitSlug] } },
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

  function getCategoryId(): number {
    if (categoryId === undefined) {
      throw new Error('Category was not created');
    }
    return categoryId;
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

  it('Given no access token, When categories are listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/categories');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given an author session, When a category weight is updated, Then access is denied', async () => {
    const owner = await registerPublisher(ownerEmail);
    ownerAccessToken = owner.accessToken;
    const category = await getRunningApp()
      .get(CategoryService)
      .createCategory({
        name: `Admin Category ${slugSuffix}`,
        slug: categorySlug,
        categoryWeight: 1.25,
      });
    categoryId = category.id;
    const actualResponse = await request(getServer())
      .patch(`/admin/categories/${getCategoryId()}`)
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({ categoryWeight: 2 });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When category weights are listed and updated, Then the configured weight is persisted', async () => {
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
    adminAccessToken = loginResponse.body.accessToken as string;
    const listResponse = await request(getServer())
      .get('/admin/categories')
      .query({ limit: 1000, offset: 0 })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    const listedCategory = (
      listResponse.body.categories as { id: number; slug: string; categoryWeight: number }[]
    ).find((category) => category.id === getCategoryId());
    expect(listedCategory?.slug).toBe(categorySlug);
    expect(listedCategory?.categoryWeight).toBe(1.25);
    const getResponse = await request(getServer())
      .get(`/admin/categories/${getCategoryId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body.id).toBe(getCategoryId());
    expect(getResponse.body.categoryWeight).toBe(1.25);
    const invalidWeight = await request(getServer())
      .patch(`/admin/categories/${getCategoryId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ categoryWeight: 0 });
    expect(invalidWeight.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(invalidWeight.body.code).toBe('BAD_USER_INPUT');
    const missingCategory = await request(getServer())
      .patch('/admin/categories/999999999')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ categoryWeight: 2 });
    expect(missingCategory.status).toBe(HttpStatus.NOT_FOUND);
    const updateResponse = await request(getServer())
      .patch(`/admin/categories/${getCategoryId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ categoryWeight: 2 });
    expect(updateResponse.status).toBe(HttpStatus.OK);
    expect(updateResponse.body.id).toBe(getCategoryId());
    expect(updateResponse.body.name).toBe(`Admin Category ${slugSuffix}`);
    expect(updateResponse.body.slug).toBe(categorySlug);
    expect(updateResponse.body.categoryWeight).toBe(2);
    const persisted = await request(getServer())
      .get(`/admin/categories/${getCategoryId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(persisted.status).toBe(HttpStatus.OK);
    expect(persisted.body.categoryWeight).toBe(2);
  });

  it('Given an author session, When a category is created, Then access is denied', async () => {
    const actualResponse = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getOwnerAccessToken()}`)
      .send({ name: `Author Create ${slugSuffix}` });
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When a category is created with a name only, Then slug and default weight are persisted', async () => {
    const createResponse = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ name: httpCreateName });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    expect(createResponse.body.name).toBe(httpCreateName);
    expect(createResponse.body.slug).toBe(httpCreateSlug);
    expect(createResponse.body.categoryWeight).toBe(1);
    const persisted = await request(getServer())
      .get(`/admin/categories/${createResponse.body.id as number}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(persisted.status).toBe(HttpStatus.OK);
    expect(persisted.body.slug).toBe(httpCreateSlug);
    expect(persisted.body.categoryWeight).toBe(1);
  });

  it('Given an admin session, When a category is created with slug and weight, Then those values are persisted', async () => {
    const createResponse = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({
        name: httpExplicitName,
        slug: httpExplicitSlug,
        categoryWeight: 1.5,
      });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    expect(createResponse.body.name).toBe(httpExplicitName);
    expect(createResponse.body.slug).toBe(httpExplicitSlug);
    expect(createResponse.body.categoryWeight).toBe(1.5);
  });

  it('Given an admin session, When create uses an existing name or slug, Then the conflict is rejected', async () => {
    const nameConflict = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ name: 'Fiction', slug: `fiction-copy-${slugSuffix}` });
    expect(nameConflict.status).toBe(HttpStatus.CONFLICT);
    expect(nameConflict.body.code).toBe('CATEGORY_NAME_CONFLICT');
    const slugConflict = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ name: `Fiction Duplicate ${slugSuffix}`, slug: 'fiction' });
    expect(slugConflict.status).toBe(HttpStatus.CONFLICT);
    expect(slugConflict.body.code).toBe('CATEGORY_SLUG_CONFLICT');
  });

  it('Given an admin session, When create omits name or uses weight 0, Then validation fails', async () => {
    const missingName = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ slug: `missing-name-${slugSuffix}` });
    expect(missingName.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(missingName.body.code).toBe('BAD_USER_INPUT');
    const invalidWeight = await request(getServer())
      .post('/admin/categories')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ name: `Zero Weight ${slugSuffix}`, categoryWeight: 0 });
    expect(invalidWeight.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(invalidWeight.body.code).toBe('BAD_USER_INPUT');
  });
});
