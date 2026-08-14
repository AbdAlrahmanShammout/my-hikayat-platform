import { EncryptionConfigService } from '@/config/encryption/encryption-config.service';
import { AES_256_GCM } from '@/providers/encryption/consts';
import { EncryptionFailureException } from '@/providers/encryption/exceptions/encryption-failure.exception';

import { EncryptionManagerService } from './encryption-manager.service';

describe('EncryptionManagerService', () => {
  const mockEncryptionConfigService = {
    key: Buffer.from('ab'.repeat(32), 'hex'),
  };
  let encryptionManagerService: EncryptionManagerService;

  beforeEach(() => {
    encryptionManagerService = new EncryptionManagerService(
      mockEncryptionConfigService as unknown as EncryptionConfigService,
    );
  });

  it('round-trips plaintext through AES-256-GCM', () => {
    const inputPlaintext = Buffer.from('epub-bytes');
    const actualEncrypted = encryptionManagerService.encrypt({ plaintext: inputPlaintext });
    expect(actualEncrypted.ciphertext.byteLength).toBeGreaterThan(
      AES_256_GCM.ivLength + AES_256_GCM.authTagLength,
    );
    expect(actualEncrypted.ciphertext.equals(inputPlaintext)).toBe(false);
    const actualDecrypted = encryptionManagerService.decrypt({
      ciphertext: actualEncrypted.ciphertext,
    });
    expect(actualDecrypted.plaintext.equals(inputPlaintext)).toBe(true);
  });

  it('rejects a truncated ciphertext', () => {
    expect(() => encryptionManagerService.decrypt({ ciphertext: Buffer.from('short') })).toThrow(
      EncryptionFailureException,
    );
  });

  it('rejects a tampered ciphertext', () => {
    const actualEncrypted = encryptionManagerService.encrypt({
      plaintext: Buffer.from('epub-bytes'),
    });
    actualEncrypted.ciphertext[actualEncrypted.ciphertext.byteLength - 1] ^= 0xff;
    expect(() =>
      encryptionManagerService.decrypt({ ciphertext: actualEncrypted.ciphertext }),
    ).toThrow(EncryptionFailureException);
  });
});
