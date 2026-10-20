import { PlatformSettingEntity } from '@/modules/platform-setting/entity/platform-setting.entity';
import { PlatformSettingInvalidAboutMissionException } from '@/modules/platform-setting/exceptions/platform-setting-invalid-about-mission.exception';
import { PlatformSettingInvalidUrlException } from '@/modules/platform-setting/exceptions/platform-setting-invalid-url.exception';
import { PlatformSettingInvalidWordsPerPageException } from '@/modules/platform-setting/exceptions/platform-setting-invalid-words-per-page.exception';

import { PlatformSettingService } from './platform-setting.service';

function createSampleSetting(
  key: string,
  value: string | null,
  id: number,
): PlatformSettingEntity {
  return new PlatformSettingEntity({
    id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    key,
    value,
  });
}

const emptySnapshot = {
  privacyPolicyUrl: null,
  termsOfServiceUrl: null,
  aboutMission: null,
  authCoverMediaUrl: null,
  wordsPerPage: 150,
};

describe('PlatformSettingService', () => {
  let mockPlatformSettingRepository: {
    findByKey: jest.Mock;
    findByKeys: jest.Mock;
    upsert: jest.Mock;
  };
  let mockTransactionRunner: { run: jest.Mock };
  let platformSettingService: PlatformSettingService;

  beforeEach(() => {
    mockPlatformSettingRepository = {
      findByKey: jest.fn(),
      findByKeys: jest.fn(),
      upsert: jest.fn(),
    };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: unknown) => Promise<unknown>) => work({})),
    };
    platformSettingService = new PlatformSettingService(
      mockPlatformSettingRepository,
      mockTransactionRunner,
    );
  });

  describe('getPlatformSettings', () => {
    it('returns null fields when no settings exist', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([]);
      const actualSettings = await platformSettingService.getPlatformSettings();
      expect(actualSettings).toEqual(emptySnapshot);
    });

    it('returns stored values for known keys', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([
        createSampleSetting('privacy_policy_url', 'https://example.com/privacy', 1),
        createSampleSetting('terms_of_service_url', 'https://example.com/terms', 2),
        createSampleSetting('about_mission', 'Read together.', 3),
        createSampleSetting('auth_cover_media_url', 'https://example.com/cover.gif', 4),
      ]);
      const actualSettings = await platformSettingService.getPlatformSettings();
      expect(actualSettings).toEqual({
        privacyPolicyUrl: 'https://example.com/privacy',
        termsOfServiceUrl: 'https://example.com/terms',
        aboutMission: 'Read together.',
        authCoverMediaUrl: 'https://example.com/cover.gif',
        wordsPerPage: 150,
      });
    });

    it('returns a stored words-per-page value', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([
        createSampleSetting('words_per_page', '180', 5),
      ]);
      const actualSettings = await platformSettingService.getPlatformSettings();
      expect(actualSettings.wordsPerPage).toBe(180);
    });
  });

  describe('updatePlatformSettings', () => {
    it('returns the current settings when every field is omitted', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([]);
      const actualSettings = await platformSettingService.updatePlatformSettings({});
      expect(mockPlatformSettingRepository.upsert).not.toHaveBeenCalled();
      expect(actualSettings).toEqual(emptySnapshot);
    });

    it('persists a normalized terms URL', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([
        createSampleSetting('terms_of_service_url', 'https://example.com/terms', 2),
      ]);
      const actualSettings = await platformSettingService.updatePlatformSettings({
        termsOfServiceUrl: '  https://example.com/terms  ',
      });
      expect(mockPlatformSettingRepository.upsert).toHaveBeenCalledWith(
        {
          key: 'terms_of_service_url',
          value: 'https://example.com/terms',
        },
        {},
      );
      expect(actualSettings.termsOfServiceUrl).toBe('https://example.com/terms');
    });

    it('clears the privacy URL when null is sent', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([]);
      const actualSettings = await platformSettingService.updatePlatformSettings({
        privacyPolicyUrl: null,
      });
      expect(mockPlatformSettingRepository.upsert).toHaveBeenCalledWith(
        {
          key: 'privacy_policy_url',
          value: null,
        },
        {},
      );
      expect(actualSettings.privacyPolicyUrl).toBeNull();
    });

    it('rejects a non-http auth cover URL', async () => {
      await expect(
        platformSettingService.updatePlatformSettings({
          authCoverMediaUrl: 'javascript:alert(1)',
        }),
      ).rejects.toBeInstanceOf(PlatformSettingInvalidUrlException);
      expect(mockPlatformSettingRepository.upsert).not.toHaveBeenCalled();
    });

    it('persists words per page and resets null to the default', async () => {
      mockPlatformSettingRepository.findByKeys.mockResolvedValue([
        createSampleSetting('words_per_page', '150', 5),
      ]);
      await platformSettingService.updatePlatformSettings({ wordsPerPage: null });
      expect(mockPlatformSettingRepository.upsert).toHaveBeenCalledWith(
        { key: 'words_per_page', value: '150' },
        {},
      );
    });

    it('rejects a words-per-page value outside the allowed range', async () => {
      await expect(
        platformSettingService.updatePlatformSettings({ wordsPerPage: 0 }),
      ).rejects.toBeInstanceOf(PlatformSettingInvalidWordsPerPageException);
      expect(mockPlatformSettingRepository.upsert).not.toHaveBeenCalled();
    });

    it('rejects an overlong about mission', async () => {
      await expect(
        platformSettingService.updatePlatformSettings({
          aboutMission: 'm'.repeat(2001),
        }),
      ).rejects.toBeInstanceOf(PlatformSettingInvalidAboutMissionException);
      expect(mockPlatformSettingRepository.upsert).not.toHaveBeenCalled();
    });
  });
});
