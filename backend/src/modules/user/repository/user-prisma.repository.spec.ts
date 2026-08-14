import { UserRole } from '@/modules/user/enum/general.enum';
import { UserMapper } from '@/modules/user/mapper/user.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { UserPrismaRepository } from './user-prisma.repository';

describe('UserPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 3,
    createdAt,
    updatedAt,
    deletedAt: null,
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: 'reader',
    isPublisher: false,
  };
  let mockPrismaProviderService: {
    user: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let userPrismaRepository: UserPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    userPrismaRepository = new UserPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a user and maps the persistence payload', async () => {
    mockPrismaProviderService.user.create.mockResolvedValue(persistenceRow);
    const actualEntity = await userPrismaRepository.create({
      email: 'reader@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.READER,
      isPublisher: false,
    });
    expect(mockPrismaProviderService.user.create).toHaveBeenCalled();
    expect(actualEntity).toEqual(UserMapper.toEntity(persistenceRow));
  });

  it('returns null when findById misses an operational user', async () => {
    mockPrismaProviderService.user.findFirst.mockResolvedValue(null);
    const actualEntity = await userPrismaRepository.findById(3);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 3, deletedAt: null },
      }),
    );
  });

  it('updates publisher capability and maps the persistence payload', async () => {
    const updatedRow = {
      ...persistenceRow,
      role: 'author',
      isPublisher: true,
    };
    mockPrismaProviderService.user.update.mockResolvedValue(updatedRow);
    const actualEntity = await userPrismaRepository.updatePublisherCapability({
      id: 3,
      role: UserRole.AUTHOR,
      isPublisher: true,
    });
    expect(mockPrismaProviderService.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        role: UserRole.AUTHOR,
        isPublisher: true,
      },
    });
    expect(actualEntity).toEqual(UserMapper.toEntity(updatedRow));
  });
});
