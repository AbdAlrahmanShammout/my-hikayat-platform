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

  describe('keyId', () => {
    it('returns the configured current key id', () => {
      mockConfigService.get.mockReturnValue('v2');
      const actualKeyId: string = encryptionConfigService.keyId;
      expect(actualKeyId).toBe('v2');
      expect(mockConfigService.get).toHaveBeenCalledWith('encryption.keyId');
    });
  });

  describe('previousKeys', () => {
    it('returns an empty list when no previous keys are configured', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'encryption.keyId') {
          return 'v1';
        }
        return '';
      });
      const actualPreviousKeys = encryptionConfigService.previousKeys;
      expect(actualPreviousKeys).toEqual([]);
    });

    it('parses previous key id and hex pairs', () => {
      const inputPreviousHex = 'cd'.repeat(32);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'encryption.keyId') {
          return 'v2';
        }
        return `v1:${inputPreviousHex}`;
      });
      const actualPreviousKeys = encryptionConfigService.previousKeys;
      expect(actualPreviousKeys).toHaveLength(1);
      expect(actualPreviousKeys[0].id).toBe('v1');
      expect(actualPreviousKeys[0].key.equals(Buffer.from(inputPreviousHex, 'hex'))).toBe(true);
    });

    it('rejects a previous key that reuses the current key id', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'encryption.keyId') {
          return 'v1';
        }
        return `v1:${'cd'.repeat(32)}`;
      });
      expect(() => encryptionConfigService.previousKeys).toThrow('Duplicate encryption key id: v1');
    });
  });
});
