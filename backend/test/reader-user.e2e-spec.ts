import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Reader user (e2e)', () => {
  const email = `publisher-${Date.now()}@user.test`;
  const password = 'correct-horse-battery';
  let app: INestApplication | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await deleteUsersByEmail(prismaProviderService, email);
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

  it('Given no access token, When publisher capability is enabled, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).post('/user/publisher');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a reader session, When publisher capability is enabled, Then an author session is returned', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    const actualResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.accessToken).toEqual(expect.any(String));
    expect(actualResponse.body.user.email).toBe(email);
    expect(actualResponse.body.user.role).toBe('author');
    expect(actualResponse.body.user.isPublisher).toBe(true);
    expect(actualResponse.body.user).not.toHaveProperty('passwordHash');
  });

  it('Given an author publisher, When publisher capability is enabled again, Then the session stays author', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email,
      password,
    });
    const actualResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.user.role).toBe('author');
    expect(actualResponse.body.user.isPublisher).toBe(true);
  });
});
