import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminInvitationService } from '@/modules/user/admin-invitation.service';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

import { AdminInvitationAdminController } from './admin-invitation.admin.controller';

function createSampleInvitation(): AdminInvitationEntity {
  return new AdminInvitationEntity({
    id: 4,
    createdAt: new Date('2026-08-17T00:00:00.000Z'),
    updatedAt: new Date('2026-08-17T00:00:00.000Z'),
    email: 'new-admin@example.com',
    tokenHash: 'hashed-token',
    status: AdminInvitationStatus.PENDING,
    expiresAt: new Date('2026-08-24T00:00:00.000Z'),
    invitedByUserId: 9,
    acceptedAt: null,
  });
}

function createSampleAdmin(): UserEntity {
  return new UserEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    isPublisher: false,
  });
}

describe('AdminInvitationAdminController', () => {
  let adminInvitationAdminController: AdminInvitationAdminController;
  let mockAdminInvitationService: {
    listPendingInvitations: jest.Mock;
    createInvitation: jest.Mock;
  };

  beforeEach(async () => {
    mockAdminInvitationService = {
      listPendingInvitations: jest.fn(),
      createInvitation: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AdminInvitationAdminController],
      providers: [
        { provide: AdminInvitationService, useValue: mockAdminInvitationService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    adminInvitationAdminController = moduleRef.get(AdminInvitationAdminController);
  });

  describe('listInvitations', () => {
    it('maps pending invitations without the token hash', async () => {
      mockAdminInvitationService.listPendingInvitations.mockResolvedValue({
        entities: [createSampleInvitation()],
        total: 1,
      });
      const actualResponse = await adminInvitationAdminController.listInvitations({
        limit: 10,
        offset: 0,
      });
      expect(mockAdminInvitationService.listPendingInvitations).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.invitations[0].email).toBe('new-admin@example.com');
      expect(actualResponse.invitations[0]).not.toHaveProperty('tokenHash');
    });
  });

  describe('createInvitation', () => {
    it('threads the signed-in admin as inviter and returns the token once', async () => {
      mockAdminInvitationService.createInvitation.mockResolvedValue({
        invitation: createSampleInvitation(),
        token: 'raw-token',
      });
      const actualResponse = await adminInvitationAdminController.createInvitation(
        { email: 'new-admin@example.com' },
        createSampleAdmin(),
      );
      expect(mockAdminInvitationService.createInvitation).toHaveBeenCalledWith({
        email: 'new-admin@example.com',
        invitedByUserId: 9,
      });
      expect(actualResponse.token).toBe('raw-token');
      expect(actualResponse.invitation.email).toBe('new-admin@example.com');
      expect(actualResponse.invitation).not.toHaveProperty('tokenHash');
    });
  });
});
