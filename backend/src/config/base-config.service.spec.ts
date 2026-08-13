import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { BaseConfigService } from './base-config.service';

describe('BaseConfigService', () => {
  let baseConfigService: BaseConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [BaseConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    baseConfigService = moduleRef.get(BaseConfigService);
  });

  describe('getValue', () => {
    it('returns the configured value when the key exists', () => {
      mockConfigService.get.mockReturnValue('configured');
      const actualValue: string = baseConfigService.getValue<string>('app.env');
      expect(actualValue).toBe('configured');
    });

    it('throws when the key is missing', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(() => baseConfigService.getValue<string>('app.missing')).toThrow(
        'Missing configuration key: app.missing',
      );
    });
  });
});
