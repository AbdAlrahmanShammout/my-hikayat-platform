import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MonetizationConfigService } from './monetization-config.service';

describe('MonetizationConfigService', () => {
  let monetizationConfigService: MonetizationConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        MonetizationConfigService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    monetizationConfigService = moduleRef.get(MonetizationConfigService);
  });

  describe('platformCutPercent', () => {
    it('returns the configured platform cut percent', () => {
      mockConfigService.get.mockReturnValue(25);
      const actualPlatformCutPercent: number = monetizationConfigService.platformCutPercent;
      expect(actualPlatformCutPercent).toBe(25);
      expect(mockConfigService.get).toHaveBeenCalledWith('monetization.platformCutPercent');
    });
  });
});
