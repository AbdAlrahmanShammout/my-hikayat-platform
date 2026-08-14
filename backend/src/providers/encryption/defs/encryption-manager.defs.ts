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
