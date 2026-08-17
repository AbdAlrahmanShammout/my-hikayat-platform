import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminInvitationMapper } from '@/modules/user/mapper/admin-invitation.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AdminInvitationPrismaRepository } from './admin-invitation-prisma.repository';

describe('AdminInvitationPrismaRepository', () => {
  const createdAt = new Date('2026-08-17T00:00:00.000Z');
  const expiresAt = new Date('2026-08-24T00:00:00.000Z');
  const persistenceRow = {
    id: 4,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    email: 'new-admin@example.com',
    tokenHash: 'hashed-token',
    status: AdminInvitationStatus.PENDING,
    expiresAt,
    invitedByUserId: 9,
    acceptedAt: null,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    adminInvitation: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let adminInvitationPrismaRepository: AdminInvitationPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      adminInvitation: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    adminInvitationPrismaRepository = new AdminInvitationPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a pending invitation and maps the persistence payload', async () => {
    mockPrismaProviderService.adminInvitation.create.mockResolvedValue(persistenceRow);
    const actualEntity = await adminInvitationPrismaRepository.create({
      email: 'new-admin@example.com',
      tokenHash: 'hashed-token',
      expiresAt,
      invitedByUserId: 9,
    });
    expect(mockPrismaProviderService.adminInvitation.create).toHaveBeenCalledWith({
      data: {
        email: 'new-admin@example.com',
        tokenHash: 'hashed-token',
        status: AdminInvitationStatus.PENDING,
        expiresAt,
        invitedByUserId: 9,
      },
    });
    expect(actualEntity).toEqual(AdminInvitationMapper.toEntity(persistenceRow));
  });

  it('returns null when the token hash is missing', async () => {
    mockPrismaProviderService.adminInvitation.findFirst.mockResolvedValue(null);
    const actualEntity = await adminInvitationPrismaRepository.findByTokenHash('missing');
    expect(actualEntity).toBeNull();
  });

  it('soft-deletes an invitation', async () => {
    mockPrismaProviderService.adminInvitation.update.mockResolvedValue(persistenceRow);
    await adminInvitationPrismaRepository.delete(4);
    expect(mockPrismaProviderService.adminInvitation.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
