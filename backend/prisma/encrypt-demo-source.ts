import { createCipheriv, randomBytes } from 'node:crypto';

const AES_256_GCM_ALGORITHM = 'aes-256-gcm' as const;
const AES_256_GCM_IV_LENGTH = 12;
const AES_256_GCM_AUTH_TAG_LENGTH = 16;
const AES_256_GCM_DATA_KEY_LENGTH = 32;
const ENVELOPE_MAGIC = Buffer.from('LIBENC01');
const ENVELOPE_VERSION = 1;
const CONTENT_ENVELOPE_VERSION = 2;

export type EncryptDemoSourceResult = {
  readonly ciphertext: Buffer;
  readonly wrappedKey: Buffer;
};

/**
 * Encrypts a demo EPUB with a per-file DEK and wraps that DEK with the backend master key.
 * Matches the production envelope so delivery-grant + content-key can open the book.
 */
export function encryptDemoSourceFile(
  plaintext: Buffer,
  masterKey: Buffer,
  keyId: string,
): EncryptDemoSourceResult {
  const dataKey: Buffer = randomBytes(AES_256_GCM_DATA_KEY_LENGTH);
  const content: GcmResult = encryptAesGcm(plaintext, dataKey);
  const wrapped: GcmResult = encryptAesGcm(dataKey, masterKey);
  const keyIdBytes: Buffer = Buffer.from(keyId, 'utf8');
  return {
    ciphertext: Buffer.concat([
      ENVELOPE_MAGIC,
      Buffer.from([CONTENT_ENVELOPE_VERSION, 0]),
      content.iv,
      content.authTag,
      content.encrypted,
    ]),
    wrappedKey: Buffer.concat([
      ENVELOPE_MAGIC,
      Buffer.from([ENVELOPE_VERSION, keyIdBytes.byteLength]),
      keyIdBytes,
      wrapped.iv,
      wrapped.authTag,
      wrapped.encrypted,
    ]),
  };
}

type GcmResult = {
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

function encryptAesGcm(plaintext: Buffer, key: Buffer): GcmResult {
  const iv: Buffer = randomBytes(AES_256_GCM_IV_LENGTH);
  const cipher = createCipheriv(AES_256_GCM_ALGORITHM, key, iv);
  const encrypted: Buffer = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag: Buffer = cipher.getAuthTag();
  if (authTag.byteLength !== AES_256_GCM_AUTH_TAG_LENGTH) {
    throw new Error('AES-GCM auth tag length is invalid');
  }
  return { iv, authTag, encrypted };
}
