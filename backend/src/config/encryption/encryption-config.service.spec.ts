import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EncryptionConfigService } from './encryption-config.service';

describe('EncryptionConfigService', () => {
  let encryptionConfigService: EncryptionConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [EncryptionConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    encryptionConfigService = moduleRef.get(EncryptionConfigService);
  });

  describe('key', () => {
    it('returns the configured AES key as bytes', () => {
      const inputHex = 'ab'.repeat(32);
      mockConfigService.get.mockReturnValue(inputHex);
      const actualKey: Buffer = encryptionConfigService.key;
      expect(actualKey.equals(Buffer.from(inputHex, 'hex'))).toBe(true);
      expect(mockConfigService.get).toHaveBeenCalledWith('encryption.key');
    });
  });
});
