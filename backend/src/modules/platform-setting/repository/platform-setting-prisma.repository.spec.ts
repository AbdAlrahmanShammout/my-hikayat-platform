import { PlatformSettingMapper } from '@/modules/platform-setting/mapper/platform-setting.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { PlatformSettingPrismaRepository } from './platform-setting-prisma.repository';

describe('PlatformSettingPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 1,
    createdAt,
    updatedAt,
    deletedAt: null,
    key: 'privacy_policy_url',
    value: 'https://example.com/privacy',
  };
  let mockPrismaProviderService: {
    platformSetting: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let platformSettingPrismaRepository: PlatformSettingPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      platformSetting: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    platformSettingPrismaRepository = new PlatformSettingPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('returns null when findByKey misses an operational setting', async () => {
    mockPrismaProviderService.platformSetting.findFirst.mockResolvedValue(null);
    const actualEntity = await platformSettingPrismaRepository.findByKey('privacy_policy_url');
    expect(actualEntity).toBeNull();
  });

  it('maps findByKeys rows onto entities', async () => {
    mockPrismaProviderService.platformSetting.findMany.mockResolvedValue([persistenceRow]);
    const actualEntities = await platformSettingPrismaRepository.findByKeys([
      'privacy_policy_url',
    ]);
    expect(mockPrismaProviderService.platformSetting.findMany).toHaveBeenCalledWith({
      where: { key: { in: ['privacy_policy_url'] }, deletedAt: null },
    });
    expect(actualEntities).toEqual([PlatformSettingMapper.toEntity(persistenceRow)]);
  });

  it('creates a setting when the key is unknown', async () => {
    mockPrismaProviderService.platformSetting.findFirst.mockResolvedValue(null);
    mockPrismaProviderService.platformSetting.create.mockResolvedValue(persistenceRow);
    const actualEntity = await platformSettingPrismaRepository.upsert({
      key: 'privacy_policy_url',
      value: 'https://example.com/privacy',
    });
    expect(mockPrismaProviderService.platformSetting.create).toHaveBeenCalledWith({
      data: {
        key: 'privacy_policy_url',
        value: 'https://example.com/privacy',
      },
    });
    expect(actualEntity).toEqual(PlatformSettingMapper.toEntity(persistenceRow));
  });

  it('updates an existing setting for the same key', async () => {
    mockPrismaProviderService.platformSetting.findFirst.mockResolvedValue(persistenceRow);
    mockPrismaProviderService.platformSetting.update.mockResolvedValue({
      ...persistenceRow,
      value: null,
    });
    const actualEntity = await platformSettingPrismaRepository.upsert({
      key: 'privacy_policy_url',
      value: null,
    });
    expect(mockPrismaProviderService.platformSetting.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        value: null,
        deletedAt: null,
      },
    });
    expect(actualEntity.value).toBeNull();
  });
});
