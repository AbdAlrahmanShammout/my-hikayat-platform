import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { Environment } from '@/config/environment';

import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let appConfigService: AppConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AppConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    appConfigService = moduleRef.get(AppConfigService);
  });

  describe('env', () => {
    it('returns the configured environment kind', () => {
      mockConfigService.get.mockReturnValue(Environment.TEST);
      const actualEnv: Environment = appConfigService.env;
      expect(actualEnv).toBe(Environment.TEST);
      expect(mockConfigService.get).toHaveBeenCalledWith('app.env');
    });
  });

  describe('port', () => {
    it('returns the configured listen port', () => {
      mockConfigService.get.mockReturnValue(4000);
      const actualPort: number = appConfigService.port;
      expect(actualPort).toBe(4000);
      expect(mockConfigService.get).toHaveBeenCalledWith('app.port');
    });
  });

  describe('allowedOrigins', () => {
    it('returns the configured CORS origin list', () => {
      const expectedOrigins: string[] = ['http://localhost:3000'];
      mockConfigService.get.mockReturnValue(expectedOrigins);
      const actualOrigins: string[] = appConfigService.allowedOrigins;
      expect(actualOrigins).toEqual(expectedOrigins);
      expect(mockConfigService.get).toHaveBeenCalledWith('app.allowedOrigins');
    });
  });
});
