import { AES_256_GCM } from '@/providers/encryption/consts';
import { ENCRYPTION_ENVELOPE } from '@/providers/encryption/encryption-envelope.constant';
import { EncryptionFailureException } from '@/providers/encryption/exceptions/encryption-failure.exception';

import { EncryptionEnvelope } from './encryption-envelope.helper';

describe('EncryptionEnvelope', () => {
  const iv = Buffer.alloc(AES_256_GCM.ivLength, 1);
  const authTag = Buffer.alloc(AES_256_GCM.authTagLength, 2);
  const encrypted = Buffer.from('cipher');

  it('packs and unpacks a versioned envelope with the key id', () => {
    const actualPacked = EncryptionEnvelope.pack({
      keyId: 'v2',
      iv,
      authTag,
      encrypted,
    });
    const actualUnpacked = EncryptionEnvelope.unpack(actualPacked);
    expect(actualUnpacked).toEqual({
      format: 'versioned',
      version: ENCRYPTION_ENVELOPE.version,
      keyId: 'v2',
      iv,
      authTag,
      encrypted,
    });
  });

  it('unpacks a legacy header as iv, auth tag, and ciphertext', () => {
    const actualUnpacked = EncryptionEnvelope.unpack(Buffer.concat([iv, authTag, encrypted]));
    expect(actualUnpacked).toEqual({
      format: 'legacy',
      iv,
      authTag,
      encrypted,
    });
  });

  it('rejects a versioned envelope with an invalid key id', () => {
    expect(() =>
      EncryptionEnvelope.pack({
        keyId: 'not a key',
        iv,
        authTag,
        encrypted,
      }),
    ).toThrow(EncryptionFailureException);
  });
});
