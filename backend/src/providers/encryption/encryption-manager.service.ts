import {
  DecryptBufferInput,
  DecryptBufferResult,
  DecryptWithDataKeyInput,
  EncryptBufferInput,
  EncryptBufferResult,
  EncryptWithDataKeyInput,
  GenerateDataKeyResult,
  UnwrapDataKeyInput,
  UnwrapDataKeyResult,
  WrapDataKeyInput,
  WrapDataKeyResult,
} from '@/providers/encryption/defs/encryption-manager.defs';

export abstract class EncryptionManagerService {
  /**
   * Encrypts with the server master KEK (envelope v1). Used for wrapping DEKs and legacy payloads.
   */
  abstract encrypt(input: EncryptBufferInput): EncryptBufferResult;

  /**
   * Decrypts master-KEK ciphertext (envelope v1 or legacy). Rejects content envelopes (v2).
   */
  abstract decrypt(input: DecryptBufferInput): DecryptBufferResult;

  abstract generateDataKey(): GenerateDataKeyResult;

  abstract wrapDataKey(input: WrapDataKeyInput): WrapDataKeyResult;

  abstract unwrapDataKey(input: UnwrapDataKeyInput): UnwrapDataKeyResult;

  abstract encryptWithDataKey(input: EncryptWithDataKeyInput): EncryptBufferResult;

  abstract decryptWithDataKey(input: DecryptWithDataKeyInput): DecryptBufferResult;
}
