import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Author and reader categories (e2e)', () => {
  const password = 'correct-horse-battery';
  const readerEmail = `audience-category-reader-${Date.now()}@book.test`;
  const authorEmail = `audience-category-author-${Date.now()}@book.test`;
  const emails = [readerEmail, authorEmail];
  let app: INestApplication | undefined;
  let readerAccessToken: string | undefined;
  let authorAccessToken: string | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
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

  function getReaderAccessToken(): string {
    if (readerAccessToken === undefined) {
      throw new Error('Reader access token was not created');
    }
    return readerAccessToken;
  }

  function getAuthorAccessToken(): string {
    if (authorAccessToken === undefined) {
      throw new Error('Author access token was not created');
    }
    return authorAccessToken;
  }

  async function registerUser(email: string): Promise<string> {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    return registerResponse.body.accessToken as string;
  }

  it('Given no access token, When author categories are listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/author/categories');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given no access token, When reader categories are listed, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/reader/categories');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reader session, When author categories are listed, Then access is denied', async () => {
    readerAccessToken = await registerUser(readerEmail);
    const actualResponse = await request(getServer())
      .get('/author/categories')
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given a reader session, When reader categories are listed, Then the taxonomy is returned', async () => {
    const actualResponse = await request(getServer())
      .get('/reader/categories')
      .query({ limit: 1000, offset: 0 })
      .set('Authorization', `Bearer ${getReaderAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    const listedCategory = (
      actualResponse.body.categories as { slug: string; categoryWeight: number }[]
    ).find((category) => category.slug === 'fiction');
    expect(listedCategory?.slug).toBe('fiction');
    expect(listedCategory?.categoryWeight).toBe(1);
    expect(actualResponse.body.total).toBeGreaterThanOrEqual(5);
  });

  it('Given an author session, When author categories are listed, Then the taxonomy is returned', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: authorEmail,
      password,
    });
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken as string}`);
    authorAccessToken = publisherResponse.body.accessToken as string;
    const actualResponse = await request(getServer())
      .get('/author/categories')
      .query({ limit: 1000, offset: 0 })
      .set('Authorization', `Bearer ${getAuthorAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    const listedCategory = (
      actualResponse.body.categories as { slug: string; categoryWeight: number }[]
    ).find((category) => category.slug === 'fiction');
    expect(listedCategory?.slug).toBe('fiction');
    expect(listedCategory?.categoryWeight).toBe(1);
    expect(actualResponse.body.total).toBeGreaterThanOrEqual(5);
  });
});
