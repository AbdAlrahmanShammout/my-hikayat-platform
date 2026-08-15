export const ENCRYPTION_ENVELOPE = {
  magic: Buffer.from('LIBENC01'),
  version: 1,
  keyIdMinLength: 1,
  keyIdMaxLength: 32,
} as const;
