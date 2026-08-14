import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtConfigService } from './jwt-config.service';

describe('JwtConfigService', () => {
  let jwtConfigService: JwtConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [JwtConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    jwtConfigService = moduleRef.get(JwtConfigService);
  });

  describe('accessSecret', () => {
    it('returns the configured access-token secret', () => {
      mockConfigService.get.mockReturnValue('access-secret');
      const actualSecret: string = jwtConfigService.accessSecret;
      expect(actualSecret).toBe('access-secret');
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.access.secret');
    });
  });

  describe('accessExpiresIn', () => {
    it('returns the configured access-token lifetime', () => {
      mockConfigService.get.mockReturnValue('15m');
      const actualExpiresIn: string = jwtConfigService.accessExpiresIn;
      expect(actualExpiresIn).toBe('15m');
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.access.expiresIn');
    });
  });

  describe('recoverySecret', () => {
    it('returns the configured recovery-token secret', () => {
      mockConfigService.get.mockReturnValue('recovery-secret');
      const actualSecret: string = jwtConfigService.recoverySecret;
      expect(actualSecret).toBe('recovery-secret');
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.recovery.secret');
    });
  });

  describe('recoveryExpiresIn', () => {
    it('returns the configured recovery-token lifetime', () => {
      mockConfigService.get.mockReturnValue('1h');
      const actualExpiresIn: string = jwtConfigService.recoveryExpiresIn;
      expect(actualExpiresIn).toBe('1h');
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.recovery.expiresIn');
    });
  });
});
