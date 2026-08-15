import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { CREDENTIAL_THROTTLE_LIMIT } from '@/common/constants/http-surface.constant';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Authentication rate limits (e2e)', () => {
  const email = `throttle-${Date.now()}@auth.test`;
  const password = 'correct-horse-battery';
  let app: INestApplication | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    await prismaProviderService.user.deleteMany({ where: { email } });
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

  it('Given repeated failed logins, When the credential limit is exceeded, Then further attempts are rejected', async () => {
    const server: Server = getServer();
    for (let i = 0; i < CREDENTIAL_THROTTLE_LIMIT; i += 1) {
      const allowedResponse = await request(server).post('/auth/login').send({
        email,
        password: 'not-the-password',
      });
      expect(allowedResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    }
    const actualResponse = await request(server).post('/auth/login').send({
      email,
      password: 'not-the-password',
    });
    expect(actualResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(actualResponse.body).toEqual(
      expect.objectContaining({
        code: 'HTTP_EXCEPTION',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      }),
    );
  });
});
