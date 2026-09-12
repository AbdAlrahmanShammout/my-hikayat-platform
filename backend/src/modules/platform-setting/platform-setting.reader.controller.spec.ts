import { Test, TestingModule } from '@nestjs/testing';

import { PlatformSettingService } from '@/modules/platform-setting/platform-setting.service';

import { PlatformSettingReaderController } from './platform-setting.reader.controller';

describe('PlatformSettingReaderController', () => {
  let platformSettingReaderController: PlatformSettingReaderController;
  let mockPlatformSettingService: {
    getPlatformSettings: jest.Mock;
  };

  beforeEach(async () => {
    mockPlatformSettingService = {
      getPlatformSettings: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PlatformSettingReaderController],
      providers: [{ provide: PlatformSettingService, useValue: mockPlatformSettingService }],
    }).compile();
    platformSettingReaderController = moduleRef.get(PlatformSettingReaderController);
  });

  describe('getPlatformSettings', () => {
    it('projects public platform settings', async () => {
      mockPlatformSettingService.getPlatformSettings.mockResolvedValue({
        privacyPolicyUrl: 'https://example.com/privacy',
        termsOfServiceUrl: null,
        aboutMission: 'Read together.',
        authCoverMediaUrl: null,
      });
      const actualResponse = await platformSettingReaderController.getPlatformSettings();
      expect(actualResponse.privacyPolicyUrl).toBe('https://example.com/privacy');
      expect(actualResponse.aboutMission).toBe('Read together.');
      expect(actualResponse.termsOfServiceUrl).toBeNull();
    });
  });
});
