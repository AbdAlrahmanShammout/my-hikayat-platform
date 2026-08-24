export const ENCRYPTION_ENVELOPE = {
  magic: Buffer.from('LIBENC01'),
  /** Master-KEK encrypted payloads (including wrapped content keys). */
  version: 1,
  /** Content encrypted with an external per-asset data key (DEK). */
  contentVersion: 2,
  keyIdMinLength: 1,
  keyIdMaxLength: 32,
} as const;
