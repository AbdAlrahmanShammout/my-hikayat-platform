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

  it('packs and unpacks a content envelope without a key id', () => {
    const actualPacked = EncryptionEnvelope.packContent({
      iv,
      authTag,
      encrypted,
    });
    const actualUnpacked = EncryptionEnvelope.unpack(actualPacked);
    expect(actualUnpacked).toEqual({
      format: 'content',
      version: ENCRYPTION_ENVELOPE.contentVersion,
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

  it('rejects a content envelope that embeds a key id', () => {
    const invalidContent = Buffer.concat([
      ENCRYPTION_ENVELOPE.magic,
      Buffer.from([ENCRYPTION_ENVELOPE.contentVersion, 2]),
      Buffer.from('v1'),
      iv,
      authTag,
      encrypted,
    ]);
    expect(() => EncryptionEnvelope.unpack(invalidContent)).toThrow(EncryptionFailureException);
  });
});
