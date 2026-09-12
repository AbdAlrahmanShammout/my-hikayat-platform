import { PlatformSettingType } from '@/modules/platform-setting/types/platform-setting-details-schema.type';

import { PlatformSettingMapper } from './platform-setting.mapper';

describe('PlatformSettingMapper', () => {
  it('maps a persistence payload onto a PlatformSettingEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: PlatformSettingType = {
      id: 1,
      createdAt,
      updatedAt,
      deletedAt: null,
      key: 'privacy_policy_url',
      value: 'https://example.com/privacy',
    };
    const actualEntity = PlatformSettingMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(1);
    expect(actualEntity.key).toBe('privacy_policy_url');
    expect(actualEntity.value).toBe('https://example.com/privacy');
  });
});
