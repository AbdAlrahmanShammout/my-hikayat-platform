import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PlatformSettingService } from '@/modules/platform-setting/platform-setting.service';

import { PlatformSettingAdminController } from './platform-setting.admin.controller';

const sampleSettings = {
  privacyPolicyUrl: 'https://example.com/privacy',
  termsOfServiceUrl: 'https://example.com/terms',
  aboutMission: 'Read together.',
  authCoverMediaUrl: 'https://example.com/cover.gif',
};

describe('PlatformSettingAdminController', () => {
  let platformSettingAdminController: PlatformSettingAdminController;
  let mockPlatformSettingService: {
    getPlatformSettings: jest.Mock;
    updatePlatformSettings: jest.Mock;
  };

  beforeEach(async () => {
    mockPlatformSettingService = {
      getPlatformSettings: jest.fn(),
      updatePlatformSettings: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [PlatformSettingAdminController],
      providers: [
        { provide: PlatformSettingService, useValue: mockPlatformSettingService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    platformSettingAdminController = moduleRef.get(PlatformSettingAdminController);
  });

  describe('getPlatformSettings', () => {
    it('projects platform settings', async () => {
      mockPlatformSettingService.getPlatformSettings.mockResolvedValue(sampleSettings);
      const actualResponse = await platformSettingAdminController.getPlatformSettings();
      expect(actualResponse.termsOfServiceUrl).toBe('https://example.com/terms');
      expect(actualResponse.authCoverMediaUrl).toBe('https://example.com/cover.gif');
    });
  });

  describe('updatePlatformSettings', () => {
    it('maps optional fields into the service', async () => {
      mockPlatformSettingService.updatePlatformSettings.mockResolvedValue(sampleSettings);
      const actualResponse = await platformSettingAdminController.updatePlatformSettings({
        termsOfServiceUrl: 'https://example.com/terms',
      });
      expect(mockPlatformSettingService.updatePlatformSettings).toHaveBeenCalledWith({
        privacyPolicyUrl: undefined,
        termsOfServiceUrl: 'https://example.com/terms',
        aboutMission: undefined,
        authCoverMediaUrl: undefined,
      });
      expect(actualResponse.termsOfServiceUrl).toBe('https://example.com/terms');
    });
  });
});
