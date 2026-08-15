import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin audit logs (e2e)', () => {
  const readerEmail = `audit-reader-${Date.now()}@audit.test`;
  const adminEmail = `audit-admin-${Date.now()}@audit.test`;
  const emails = [readerEmail, adminEmail];
  const password = 'correct-horse-battery';
  let app: INestApplication | undefined;
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

  it('Given no access token, When GET /admin/audit-logs, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/audit-logs');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a reader session, When GET /admin/audit-logs, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    readerUserId = registerResponse.body.user.id as number;
    readerAccessToken = registerResponse.body.accessToken as string;
    const actualResponse = await request(getServer())
      .get('/admin/audit-logs')
      .set('Authorization', `Bearer ${readerAccessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given publisher enablement, When an admin lists audit logs, Then the publishing action is recorded', async () => {
    const publisherResponse = await request(getServer())
      .post('/user/publisher')
      .set('Authorization', `Bearer ${readerAccessToken}`);
    expect(publisherResponse.status).toBe(HttpStatus.OK);
    const adminRegister = await request(getServer()).post('/auth/register').send({
      email: adminEmail,
      password,
    });
    expect(adminRegister.status).toBe(HttpStatus.CREATED);
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.user.update({
      where: { id: adminRegister.body.user.id as number },
      data: { role: UserRole.ADMIN },
    });
    const loginResponse = await request(getServer()).post('/auth/login').send({
      email: adminEmail,
      password,
    });
    adminAccessToken = loginResponse.body.accessToken as string;
    const actualResponse = await request(getServer())
      .get('/admin/audit-logs')
      .query({ action: AuditAction.PUBLISHER_ENABLED, subjectId: readerUserId })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(actualResponse.status).toBe(HttpStatus.OK);
    expect(actualResponse.body.total).toBeGreaterThanOrEqual(1);
    expect(actualResponse.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: readerUserId,
        action: AuditAction.PUBLISHER_ENABLED,
        subjectType: AuditSubjectType.USER,
        subjectId: readerUserId,
      }),
    );
    const detailResponse = await request(getServer())
      .get(`/admin/audit-logs/${actualResponse.body.auditLogs[0].id as number}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(detailResponse.status).toBe(HttpStatus.OK);
    expect(detailResponse.body.action).toBe(AuditAction.PUBLISHER_ENABLED);
  });
});
