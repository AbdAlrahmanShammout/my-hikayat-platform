import { PlatformSettingEntity } from './platform-setting.entity';

describe('PlatformSettingEntity', () => {
  it('holds a setting key and optional value', () => {
    const actualEntity = new PlatformSettingEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      key: 'privacy_policy_url',
      value: 'https://example.com/privacy',
    });
    expect(actualEntity.key).toBe('privacy_policy_url');
    expect(actualEntity.value).toBe('https://example.com/privacy');
  });
});
