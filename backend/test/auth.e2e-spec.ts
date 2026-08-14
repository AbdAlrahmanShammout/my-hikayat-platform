import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Authentication (e2e)', () => {
  const email = `reader-${Date.now()}@auth.test`;
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

  it('Given new credentials, When register is called, Then a reader session is returned', async () => {
    const actualResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    expect(actualResponse.status).toBe(HttpStatus.CREATED);
    expect(actualResponse.body.accessToken).toEqual(expect.any(String));
    expect(actualResponse.body.tokenType).toBe('Bearer');
    expect(actualResponse.body.user.email).toBe(email);
    expect(actualResponse.body.user.role).toBe('reader');
    expect(actualResponse.body.user).not.toHaveProperty('passwordHash');
  });

  it('Given an existing email, When register is called, Then a conflict is returned', async () => {
    const actualResponse = await request(getServer()).post('/auth/register').send({
      email,
      password,
    });
    expect(actualResponse.status).toBe(HttpStatus.CONFLICT);
    expect(actualResponse.body.code).toBe('USER_EMAIL_CONFLICT');
  });

  it('Given valid credentials, When login is called, Then a session is returned', async () => {
    const actualResponse = await request(getServer()).post('/auth/login').send({
      email,
      password,
    });
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.accessToken).toEqual(expect.any(String));
    expect(actualResponse.body.user.email).toBe(email);
  });

  it('Given a wrong password, When login is called, Then authentication fails without revealing why', async () => {
    const actualResponse = await request(getServer()).post('/auth/login').send({
      email,
      password: 'not-the-password',
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given an unknown email, When login is called, Then authentication fails without revealing why', async () => {
    const actualResponse = await request(getServer()).post('/auth/login').send({
      email: 'missing@auth.test',
      password,
    });
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given a short password, When register is called, Then validation fails', async () => {
    const actualResponse = await request(getServer())
      .post('/auth/register')
      .send({
        email: `short-${Date.now()}@auth.test`,
        password: 'short',
      });
    expect(actualResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(actualResponse.body.code).toBe('BAD_USER_INPUT');
  });
});
