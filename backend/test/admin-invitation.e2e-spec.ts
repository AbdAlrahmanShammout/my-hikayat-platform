import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { MailManagerService } from '@/providers/mail/mail-manager.service';
import { MemoryMailManagerService } from '@/providers/mail/memory/memory-mail-manager.service';

import { createTestingApp } from './create-testing-app';
import { deleteUsersByEmail } from './delete-users.helper';

describe('Admin invitations (e2e)', () => {
  const password = 'correct-horse-battery';
  const suffix = `${Date.now()}`;
  const adminEmail = `admin-invite-admin-${suffix}@user.test`;
  const readerEmail = `admin-invite-reader-${suffix}@user.test`;
  const invitedEmail = `admin-invite-new-${suffix}@user.test`;
  const existingEmail = `admin-invite-existing-${suffix}@user.test`;
  const expiredEmail = `admin-invite-expired-${suffix}@user.test`;
  const emails = [adminEmail, readerEmail, invitedEmail, existingEmail, expiredEmail];
  let app: INestApplication | undefined;
  let adminUserId: number | undefined;
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

  function getAdminUserId(): number {
    if (adminUserId === undefined) {
      throw new Error('Admin user id was not initialized');
    }
    return adminUserId;
  }

  it('Given no access token, When GET /admin/invitations, Then authentication fails', async () => {
    const actualResponse = await request(getServer()).get('/admin/invitations');
    expect(actualResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('Given a reader session, When GET /admin/invitations, Then access is denied', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: readerEmail,
      password,
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    readerAccessToken = registerResponse.body.accessToken as string;
    const actualResponse = await request(getServer())
      .get('/admin/invitations')
      .set('Authorization', `Bearer ${readerAccessToken}`);
    expect(actualResponse.status).toBe(HttpStatus.FORBIDDEN);
    expect(actualResponse.body.code).toBe('ACCESS_DENIED');
  });

  it('Given an admin session, When an invitation is created and listed, Then the token is returned only at create', async () => {
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
    const createResponse = await request(getServer())
      .post('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ email: invitedEmail });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    expect(createResponse.body.token).toEqual(expect.any(String));
    expect(createResponse.body.invitation).toEqual(
      expect.objectContaining({
        email: invitedEmail,
        status: 'pending',
        invitedByUserId: getAdminUserId(),
      }),
    );
    expect(createResponse.body.invitation).not.toHaveProperty('tokenHash');
    const mailManagerService = getRunningApp().get(MailManagerService);
    if (!(mailManagerService instanceof MemoryMailManagerService)) {
      throw new Error('Expected the memory mail manager in tests');
    }
    const sentInvitationMail = mailManagerService
      .readSentMessages()
      .find((message) => message.to === invitedEmail);
    expect(sentInvitationMail).toEqual(
      expect.objectContaining({
        to: invitedEmail,
        subject: expect.stringContaining('Noory'),
        text: expect.stringContaining(
          `/accept-admin-invitation?token=${encodeURIComponent(createResponse.body.token as string)}`,
        ),
      }),
    );
    expect(sentInvitationMail?.text).toContain('expires');
    expect(sentInvitationMail?.text).not.toContain(password);
    const duplicateResponse = await request(getServer())
      .post('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ email: invitedEmail });
    expect(duplicateResponse.status).toBe(HttpStatus.CONFLICT);
    expect(duplicateResponse.body.code).toBe('ADMIN_INVITATION_PENDING');
    const listResponse = await request(getServer())
      .get('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(listResponse.body.total).toBeGreaterThanOrEqual(1);
    const listedInvitation = (listResponse.body.invitations as Array<Record<string, unknown>>).find(
      (invitation) => invitation.email === invitedEmail,
    );
    expect(listedInvitation).toEqual(
      expect.objectContaining({
        email: invitedEmail,
        status: 'pending',
      }),
    );
    expect(listedInvitation).not.toHaveProperty('token');
    expect(listedInvitation).not.toHaveProperty('tokenHash');
    const acceptResponse = await request(getServer())
      .post('/auth/accept-admin-invitation')
      .send({
        token: createResponse.body.token as string,
        password,
      });
    expect(acceptResponse.status).toBe(HttpStatus.CREATED);
    expect(acceptResponse.body.user).toEqual(
      expect.objectContaining({
        email: invitedEmail,
        role: UserRole.ADMIN,
        isPublisher: false,
      }),
    );
    expect(acceptResponse.body.user).not.toHaveProperty('passwordHash');
    expect(acceptResponse.body.accessToken).toEqual(expect.any(String));
    const auditResponse = await request(getServer())
      .get('/admin/audit-logs')
      .query({
        action: AuditAction.USER_ROLE_CHANGED,
        subjectId: acceptResponse.body.user.id as number,
      })
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(auditResponse.status).toBe(HttpStatus.OK);
    expect(auditResponse.body.auditLogs[0]).toEqual(
      expect.objectContaining({
        actorUserId: getAdminUserId(),
        action: AuditAction.USER_ROLE_CHANGED,
        subjectType: AuditSubjectType.USER,
        subjectId: acceptResponse.body.user.id as number,
        metadata: expect.objectContaining({
          toRole: UserRole.ADMIN,
          grantedByInvitation: true,
        }),
      }),
    );
    const replayResponse = await request(getServer())
      .post('/auth/accept-admin-invitation')
      .send({
        token: createResponse.body.token as string,
        password,
      });
    expect(replayResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(replayResponse.body.code).toBe('ADMIN_INVITATION_ALREADY_ACCEPTED');
    const alreadyAdminInvite = await request(getServer())
      .post('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ email: invitedEmail });
    expect(alreadyAdminInvite.status).toBe(HttpStatus.BAD_REQUEST);
    expect(alreadyAdminInvite.body.code).toBe('ADMIN_INVITATION_ALREADY_ADMIN');
  });

  it('Given an existing non-admin, When they accept an invitation, Then they become admin and keep publisher capability', async () => {
    const registerResponse = await request(getServer()).post('/auth/register').send({
      email: existingEmail,
      password: 'original-horse-battery',
    });
    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    const publisherResponse = await request(getServer())
      .patch(`/admin/users/${registerResponse.body.user.id as number}`)
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ isPublisher: true });
    expect(publisherResponse.status).toBe(HttpStatus.OK);
    expect(publisherResponse.body.role).toBe(UserRole.AUTHOR);
    const createResponse = await request(getServer())
      .post('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ email: existingEmail });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    const acceptResponse = await request(getServer())
      .post('/auth/accept-admin-invitation')
      .send({
        token: createResponse.body.token as string,
        password,
      });
    expect(acceptResponse.status).toBe(HttpStatus.CREATED);
    expect(acceptResponse.body.user).toEqual(
      expect.objectContaining({
        email: existingEmail,
        role: UserRole.ADMIN,
        isPublisher: true,
      }),
    );
    const oldPasswordLogin = await request(getServer()).post('/auth/login').send({
      email: existingEmail,
      password: 'original-horse-battery',
    });
    expect(oldPasswordLogin.status).toBe(HttpStatus.UNAUTHORIZED);
    const newPasswordLogin = await request(getServer()).post('/auth/login').send({
      email: existingEmail,
      password,
    });
    expect(newPasswordLogin.status).toBe(HttpStatus.OK);
    expect(newPasswordLogin.body.user.role).toBe(UserRole.ADMIN);
  });

  it('Given an expired invitation, When accepted, Then the grant is rejected', async () => {
    const createResponse = await request(getServer())
      .post('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`)
      .send({ email: expiredEmail });
    expect(createResponse.status).toBe(HttpStatus.CREATED);
    const prismaProviderService: PrismaProviderService = getRunningApp().get(PrismaProviderService);
    await prismaProviderService.adminInvitation.update({
      where: { id: createResponse.body.invitation.id as number },
      data: { expiresAt: new Date('2020-01-01T00:00:00.000Z') },
    });
    const actualResponse = await request(getServer())
      .post('/auth/accept-admin-invitation')
      .send({
        token: createResponse.body.token as string,
        password,
      });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('ADMIN_INVITATION_EXPIRED');
    const listResponse = await request(getServer())
      .get('/admin/invitations')
      .set('Authorization', `Bearer ${getAdminAccessToken()}`);
    expect(listResponse.status).toBe(HttpStatus.OK);
    expect(
      (listResponse.body.invitations as Array<{ email: string }>).some(
        (invitation) => invitation.email === expiredEmail,
      ),
    ).toBe(false);
  });

  it('Given an unknown token, When accepted, Then the grant is rejected', async () => {
    const actualResponse = await request(getServer()).post('/auth/accept-admin-invitation').send({
      token: 'not-a-real-invitation-token',
      password,
    });
    expect(actualResponse.status).toBe(HttpStatus.BAD_REQUEST);
    expect(actualResponse.body.code).toBe('ADMIN_INVITATION_INVALID');
  });
});
