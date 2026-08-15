import { createCipheriv, randomBytes } from 'node:crypto';

import { EncryptionConfigService } from '@/config/encryption/encryption-config.service';
import { AES_256_GCM } from '@/providers/encryption/consts';
import { ENCRYPTION_ENVELOPE } from '@/providers/encryption/encryption-envelope.constant';
import { EncryptionFailureException } from '@/providers/encryption/exceptions/encryption-failure.exception';

import { NodeEncryptionManagerService } from './node-encryption-manager.service';

function createLegacyCiphertext(plaintext: Buffer, key: Buffer): Buffer {
  const iv: Buffer = randomBytes(AES_256_GCM.ivLength);
  const cipher = createCipheriv(AES_256_GCM.algorithm, key, iv);
  const encrypted: Buffer = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}

describe('NodeEncryptionManagerService', () => {
  const currentKey = Buffer.from('ab'.repeat(32), 'hex');
  const previousKey = Buffer.from('cd'.repeat(32), 'hex');
  let mockEncryptionConfigService: {
    key: Buffer;
    keyId: string;
    previousKeys: Array<{ readonly id: string; readonly key: Buffer }>;
  };
  let nodeEncryptionManagerService: NodeEncryptionManagerService;

  beforeEach(() => {
    mockEncryptionConfigService = {
      key: currentKey,
      keyId: 'v2',
      previousKeys: [{ id: 'v1', key: previousKey }],
    };
    nodeEncryptionManagerService = new NodeEncryptionManagerService(
      mockEncryptionConfigService as unknown as EncryptionConfigService,
    );
  });

  it('round-trips plaintext through a versioned AES-256-GCM envelope', () => {
    const inputPlaintext = Buffer.from('epub-bytes');
    const actualEncrypted = nodeEncryptionManagerService.encrypt({ plaintext: inputPlaintext });
    expect(
      actualEncrypted.ciphertext
        .subarray(0, ENCRYPTION_ENVELOPE.magic.byteLength)
        .equals(ENCRYPTION_ENVELOPE.magic),
    ).toBe(true);
    expect(actualEncrypted.ciphertext.equals(inputPlaintext)).toBe(false);
    const actualDecrypted = nodeEncryptionManagerService.decrypt({
      ciphertext: actualEncrypted.ciphertext,
    });
    expect(actualDecrypted.plaintext.equals(inputPlaintext)).toBe(true);
  });

  it('decrypts a legacy ciphertext written before key ids existed', () => {
    const inputPlaintext = Buffer.from('legacy-epub-bytes');
    const actualDecrypted = nodeEncryptionManagerService.decrypt({
      ciphertext: createLegacyCiphertext(inputPlaintext, currentKey),
    });
    expect(actualDecrypted.plaintext.equals(inputPlaintext)).toBe(true);
  });

  it('decrypts a versioned envelope with a previous key after rotation', () => {
    const inputPlaintext = Buffer.from('rotated-versioned-bytes');
    const previousManager = new NodeEncryptionManagerService({
      key: previousKey,
      keyId: 'v1',
      previousKeys: [],
    } as unknown as EncryptionConfigService);
    const actualEncrypted = previousManager.encrypt({ plaintext: inputPlaintext });
    const actualDecrypted = nodeEncryptionManagerService.decrypt({
      ciphertext: actualEncrypted.ciphertext,
    });
    expect(actualDecrypted.plaintext.equals(inputPlaintext)).toBe(true);
  });

  it('decrypts a legacy ciphertext with a previous key after rotation', () => {
    const inputPlaintext = Buffer.from('rotated-epub-bytes');
    const actualDecrypted = nodeEncryptionManagerService.decrypt({
      ciphertext: createLegacyCiphertext(inputPlaintext, previousKey),
    });
    expect(actualDecrypted.plaintext.equals(inputPlaintext)).toBe(true);
  });

  it('rejects a versioned envelope whose key id is unknown', () => {
    const actualEncrypted = nodeEncryptionManagerService.encrypt({
      plaintext: Buffer.from('epub-bytes'),
    });
    actualEncrypted.ciphertext[ENCRYPTION_ENVELOPE.magic.byteLength + 2] = 'z'.charCodeAt(0);
    expect(() =>
      nodeEncryptionManagerService.decrypt({ ciphertext: actualEncrypted.ciphertext }),
    ).toThrow(EncryptionFailureException);
  });

  it('rejects a truncated ciphertext', () => {
    expect(() =>
      nodeEncryptionManagerService.decrypt({ ciphertext: Buffer.from('short') }),
    ).toThrow(EncryptionFailureException);
  });

  it('rejects a tampered ciphertext', () => {
    const actualEncrypted = nodeEncryptionManagerService.encrypt({
      plaintext: Buffer.from('epub-bytes'),
    });
    actualEncrypted.ciphertext[actualEncrypted.ciphertext.byteLength - 1] ^= 0xff;
    expect(() =>
      nodeEncryptionManagerService.decrypt({ ciphertext: actualEncrypted.ciphertext }),
    ).toThrow(EncryptionFailureException);
  });
});
