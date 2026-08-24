import { gcm } from '@noble/ciphers/aes.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

import { READER_CONTENT_ENCRYPTION } from '@/features/reader/lib/reader-content-encryption.constant';

export type ContentEncryptionEnvelope = {
  readonly iv: Uint8Array;
  readonly authTag: Uint8Array;
  readonly encrypted: Uint8Array;
};

/**
 * Unpacks a LIBENC01 content envelope (version 2, external DEK).
 */
export function unpackContentEnvelope(ciphertext: Uint8Array): ContentEncryptionEnvelope {
  const magicLength: number = READER_CONTENT_ENCRYPTION.magic.byteLength;
  if (ciphertext.byteLength < magicLength + 2) {
    throw new Error('Encrypted book file is truncated.');
  }
  for (let index = 0; index < magicLength; index += 1) {
    if (ciphertext[index] !== READER_CONTENT_ENCRYPTION.magic[index]) {
      throw new Error('Encrypted book file has an unknown format.');
    }
  }
  const version: number = ciphertext[magicLength] ?? -1;
  const keyIdLength: number = ciphertext[magicLength + 1] ?? -1;
  if (version !== READER_CONTENT_ENCRYPTION.contentVersion || keyIdLength !== 0) {
    throw new Error('Encrypted book file is not ready for this reader.');
  }
  const keyIdStart: number = magicLength + 2;
  const headerLength: number =
    keyIdStart + READER_CONTENT_ENCRYPTION.ivLength + READER_CONTENT_ENCRYPTION.authTagLength;
  if (ciphertext.byteLength < headerLength) {
    throw new Error('Encrypted book file is truncated.');
  }
  const authTagStart: number = keyIdStart + READER_CONTENT_ENCRYPTION.ivLength;
  return {
    iv: ciphertext.subarray(keyIdStart, authTagStart),
    authTag: ciphertext.subarray(authTagStart, headerLength),
    encrypted: ciphertext.subarray(headerLength),
  };
}

/**
 * Verifies the SHA-256 hex digest of ciphertext before decryption.
 */
export function verifyCiphertextChecksum(
  ciphertext: Uint8Array,
  expectedChecksumSha256: string | null | undefined,
): void {
  if (expectedChecksumSha256 === null || expectedChecksumSha256 === undefined) {
    return;
  }
  const expected: string = expectedChecksumSha256.trim().toLowerCase();
  if (expected.length === 0) {
    return;
  }
  const actual: string = bytesToHex(sha256(ciphertext));
  if (actual !== expected) {
    throw new Error('Downloaded book file failed integrity check.');
  }
}

/**
 * Decrypts content-envelope ciphertext with a per-asset DEK. Does not persist key or plaintext.
 */
export function decryptContentWithDataKey(input: {
  readonly ciphertext: Uint8Array;
  readonly dataKey: Uint8Array;
}): Uint8Array {
  if (input.dataKey.byteLength !== READER_CONTENT_ENCRYPTION.dataKeyLength) {
    throw new Error('Content key is invalid.');
  }
  const envelope: ContentEncryptionEnvelope = unpackContentEnvelope(input.ciphertext);
  const sealed: Uint8Array = new Uint8Array(envelope.encrypted.byteLength + envelope.authTag.byteLength);
  sealed.set(envelope.encrypted, 0);
  sealed.set(envelope.authTag, envelope.encrypted.byteLength);
  const aes = gcm(input.dataKey, envelope.iv);
  return aes.decrypt(sealed);
}

/**
 * Decodes a base64 content key from the reader content-key API.
 */
export function decodeContentKeyBase64(keyBase64: string): Uint8Array {
  const normalized: string = keyBase64.trim();
  if (normalized.length === 0) {
    throw new Error('Content key is missing.');
  }
  const binary: string = globalThis.atob(normalized);
  const bytes: Uint8Array = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  if (bytes.byteLength !== READER_CONTENT_ENCRYPTION.dataKeyLength) {
    throw new Error('Content key is invalid.');
  }
  return bytes;
}
