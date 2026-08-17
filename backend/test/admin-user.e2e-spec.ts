import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin users (e2e)', () => {
  const password = 'correct-horse-battery';
  const adminEmail = `admin-users-admin-${Date.now()}@user.test`;
  const readerEmail = `admin-users-reader-${Date.now()}@user.test`;
  const emails = [adminEmail, readerEmail];
  let app: INestApplication | undefined;
  let adminUserId: number | undefined;
  let readerUserId: number | undefined;
  let adminAccessToken: string | undefined;
  let readerAccessToken: string | undefined;

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

  function getAdminAccessToken(): string {
    if (adminAccessToken === undefined) {
      throw new Error('Admin access token was not initialized');
    }
    return adminAccessToken;
  }

  function getReaderUserId(): number {
    if (readerUserId === undefined) {
      throw new Error('Reader user id was not initialized');
    }
    return readerUserId;
  }

  function getAdminUserId(): number {
    if (adminUserId === undefined) {
      throw new Error('Admin user id was not initialized');
    }
    return adminUserId;
  }

  it('Given no access token, When GET /admin/users, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/users');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a reader session, When GET /admin/users, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    readerUserId = registerResponse.body.user.id as number;
    readerAccessToken = registerResponse.body.accessToken as string;
    const actualResponse = await request(getServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${readerAccessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When users are listed and updated, Then role changes are persisted and audited', async () => {
    const adminRegister = await request(getServer()).post('/auth/register').send({
      email: adminEmail,
      password,
    });
    expect(adminRegister.status).toBe(HttpStatus.CREATED);
    adminUserId = adminRegister.body.user.id as number;
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.user.update({
      where: { id: getAdminUserId() },
      data: { role: UserRole.ADMIN },
    });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    adminAccessToken = loginResponse.body.accessToken as string;
    const listResponse = await request(getServer())
      .get('/admin/users')
      .query({ email: readerEmail })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.users[0]).toEqual(
      expect.objectContaining({
        id: getReaderUserId(),
        email: readerEmail,
        role: UserRole.READER,
        isPublisher: false,
      }),
    );
    expect(listResponse.body.users[0]).not.toHaveProperty('passwordHash');
    const detailResponse = await request(getServer())
      .get(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(detailResponse.status).toBe(HttpStatus.OK);
    expect(detailResponse.body.email).toBe(readerEmail);
    const publisherResponse = await request(getServer())
      .patch(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ isPublisher: true });
    expect(publisherResponse.status).toBe(HttpStatus.OK);
    expect(publisherResponse.body.role).toBe(UserRole.AUTHOR);
    expect(publisherResponse.body.isPublisher).toBe(true);
    const promoteResponse = await request(getServer())
      .patch(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ role: UserRole.ADMIN });
    expect(promoteResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(promoteResponse.body.code).toBe('USER_ADMIN_INVITE_REQUIRED');
    const auditResponse = await request(getServer())
      .get('/admin/audit-logs')
      .query({ action: AuditAction.USER_ROLE_CHANGED, subjectId: getReaderUserId() })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(auditResponse.status).toBe(HttpStatus.OK);
    expect(auditResponse.body.total).toBeGreaterThanOrEqual(1);
    expect(auditResponse.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: getAdminUserId(),
        action: AuditAction.USER_ROLE_CHANGED,
        subjectType: AuditSubjectType.USER,
        subjectId: getReaderUserId(),
      }),
    );
  });

  it('Given the signed-in admin, When they patch their own role, Then the change is rejected', async () => {
    const actualResponse = await request(getServer())
      .patch(`/admin/users/${getAdminUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ role: UserRole.READER });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('USER_SELF_MANAGEMENT');
  });

  it('Given an author role without publisher capability, When patched, Then the change is rejected', async () => {
    const actualResponse = await request(getServer())
      .patch(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ role: UserRole.AUTHOR, isPublisher: false });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('USER_INVALID_CAPABILITY');
  });

  it('Given a managed user, When the admin deletes them, Then the user disappears from management and cannot log in', async () => {
    const demoteResponse = await request(getServer())
      .patch(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ role: UserRole.READER });
    expect(demoteResponse.status).toBe(HttpStatus.OK);
    expect(demoteResponse.body.role).toBe(UserRole.READER);
    const deleteResponse = await request(getServer())
      .delete(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(deleteResponse.status).toBe(HttpStatus.OK);
    expect(deleteResponse.body.id).toBe(getReaderUserId());
    const missingResponse = await request(getServer())
      .get(`/admin/users/${getReaderUserId()}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(missingResponse.status).toBe(HttpStatus.NOT_FOUND);
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: readerEmail,
      password,
    });
    expect(loginResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(loginResponse.body.code).toBe('AUTHENTICATION_FAILED');
  });
});
