export type EncryptBufferInput = {
  readonly plaintext: Buffer;
};

export type EncryptBufferResult = {
  readonly ciphertext: Buffer;
};

export type DecryptBufferInput = {
  readonly ciphertext: Buffer;
};

export type DecryptBufferResult = {
  readonly plaintext: Buffer;
};

export type GenerateDataKeyResult = {
  readonly dataKey: Buffer;
};

export type WrapDataKeyInput = {
  readonly dataKey: Buffer;
};

export type WrapDataKeyResult = {
  readonly wrappedKey: Buffer;
  readonly keyId: string;
};

export type UnwrapDataKeyInput = {
  readonly wrappedKey: Buffer;
};

export type UnwrapDataKeyResult = {
  readonly dataKey: Buffer;
  readonly keyId: string;
};

export type EncryptWithDataKeyInput = {
  readonly plaintext: Buffer;
  readonly dataKey: Buffer;
};

export type DecryptWithDataKeyInput = {
  readonly ciphertext: Buffer;
  readonly dataKey: Buffer;
};

export type PackEncryptionEnvelopeInput = {
  readonly keyId: string;
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

export type PackContentEncryptionEnvelopeInput = {
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

export type VersionedEncryptionEnvelope = {
  readonly format: 'versioned';
  readonly version: number;
  readonly keyId: string;
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

export type ContentEncryptionEnvelope = {
  readonly format: 'content';
  readonly version: number;
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

export type LegacyEncryptionEnvelope = {
  readonly format: 'legacy';
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

export type UnpackedEncryptionEnvelope =
  VersionedEncryptionEnvelope | ContentEncryptionEnvelope | LegacyEncryptionEnvelope;
