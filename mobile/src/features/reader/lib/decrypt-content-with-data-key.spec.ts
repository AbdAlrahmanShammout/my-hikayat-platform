import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { sha256 } from '@noble/hashes/sha2.js';

import {
  decodeContentKeyBase64,
  decryptContentWithDataKey,
  unpackContentEnvelope,
  verifyCiphertextChecksum,
} from '@/features/reader/lib/decrypt-content-with-data-key';
import { READER_CONTENT_ENCRYPTION } from '@/features/reader/lib/reader-content-encryption.constant';

function packContentEnvelope(input: {
  readonly iv: Uint8Array;
  readonly authTag: Uint8Array;
  readonly encrypted: Uint8Array;
}): Uint8Array {
  const header = new Uint8Array([
    ...READER_CONTENT_ENCRYPTION.magic,
    READER_CONTENT_ENCRYPTION.contentVersion,
    0,
  ]);
  const packed = new Uint8Array(
    header.byteLength + input.iv.byteLength + input.authTag.byteLength + input.encrypted.byteLength,
  );
  packed.set(header, 0);
  packed.set(input.iv, header.byteLength);
  packed.set(input.authTag, header.byteLength + input.iv.byteLength);
  packed.set(input.encrypted, header.byteLength + input.iv.byteLength + input.authTag.byteLength);
  return packed;
}

function encryptFixture(plaintext: Uint8Array, dataKey: Uint8Array): Uint8Array {
  const iv = new Uint8Array(READER_CONTENT_ENCRYPTION.ivLength).fill(3);
  const aes = gcm(dataKey, iv);
  const sealed = aes.encrypt(plaintext);
  const encrypted = sealed.subarray(0, sealed.byteLength - READER_CONTENT_ENCRYPTION.authTagLength);
  const authTag = sealed.subarray(sealed.byteLength - READER_CONTENT_ENCRYPTION.authTagLength);
  return packContentEnvelope({ iv, authTag, encrypted });
}

describe('decryptContentWithDataKey', () => {
  it('round-trips content-envelope ciphertext with a DEK', () => {
    const plaintext = new TextEncoder().encode('epub-bytes');
    const dataKey = new Uint8Array(READER_CONTENT_ENCRYPTION.dataKeyLength).fill(9);
    const ciphertext = encryptFixture(plaintext, dataKey);
    const envelope = unpackContentEnvelope(ciphertext);
    expect(envelope.iv.byteLength).toBe(READER_CONTENT_ENCRYPTION.ivLength);
    const actual = decryptContentWithDataKey({ ciphertext, dataKey });
    expect(new TextDecoder().decode(actual)).toBe('epub-bytes');
  });

  it('verifies ciphertext checksum before trusting the download', () => {
    const ciphertext = new Uint8Array([1, 2, 3, 4]);
    const checksum = bytesToHex(sha256(ciphertext));
    expect(() => verifyCiphertextChecksum(ciphertext, checksum)).not.toThrow();
    expect(() => verifyCiphertextChecksum(ciphertext, 'aa'.repeat(32))).toThrow(
      /integrity check/i,
    );
  });

  it('decodes a base64 content key of the expected length', () => {
    const dataKey = new Uint8Array(READER_CONTENT_ENCRYPTION.dataKeyLength).fill(5);
    const encoded = globalThis.btoa(String.fromCharCode(...dataKey));
    const actual = decodeContentKeyBase64(encoded);
    expect(actual).toEqual(dataKey);
  });
});
