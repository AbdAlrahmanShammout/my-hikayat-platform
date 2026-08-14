import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

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

  it('Given a valid access token, When GET /auth/me is called, Then the principal is returned', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email,
      password,
    });
    const actualResponse = await request(getServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.email).toBe(email);
    expect(actualResponse.body).not.toHaveProperty('passwordHash');
  });

  it('Given no access token, When GET /auth/me is called, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/auth/me');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });

  it('Given an invalid access token, When GET /auth/me is called, Then the token is rejected', async () => {
    const actualResponse = await request(getServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('JWT_INVALID');
  });

  it('Given a recovery token, When GET /auth/me is called, Then the token is rejected', async () => {
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email,
      password,
    });
    const jwtTokenService: JwtTokenService = getRunningApp().get(JwtTokenService);
    const recoveryToken: string = jwtTokenService.createToken({
      payload: {
        principalId: loginResponse.body.user.id as number,
        role: loginResponse.body.user.role as string,
      },
      purpose: JwtTokenPurpose.RECOVERY,
    });
    const actualResponse = await request(getServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${recoveryToken}`);
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(actualResponse.body.code).toBe('JWT_INVALID');
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
