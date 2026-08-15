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

export type PackEncryptionEnvelopeInput = {
  readonly keyId: string;
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

export type LegacyEncryptionEnvelope = {
  readonly format: 'legacy';
  readonly iv: Buffer;
  readonly authTag: Buffer;
  readonly encrypted: Buffer;
};

export type UnpackedEncryptionEnvelope = VersionedEncryptionEnvelope | LegacyEncryptionEnvelope;
