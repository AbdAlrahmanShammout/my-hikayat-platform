import * as Joi from 'joi';

export const ENCRYPTION_KEY_HEX_LENGTH = 64;
export const ENCRYPTION_KEY_ID_DEFAULT = 'v1';
export const ENCRYPTION_KEY_ID_PATTERN = /^[A-Za-z0-9._-]{1,32}$/;
export const ENCRYPTION_PREVIOUS_KEYS_DEFAULT = '';
export const ENCRYPTION_PREVIOUS_KEYS_PATTERN =
  /^(?:[A-Za-z0-9._-]{1,32}:[0-9a-fA-F]{64}(?:,[A-Za-z0-9._-]{1,32}:[0-9a-fA-F]{64})*)?$/;

export const encryptionConfigSchema = {
  ENCRYPTION_KEY: Joi.string().hex().length(ENCRYPTION_KEY_HEX_LENGTH).required(),
  ENCRYPTION_KEY_ID: Joi.string()
    .pattern(ENCRYPTION_KEY_ID_PATTERN)
    .default(ENCRYPTION_KEY_ID_DEFAULT),
  ENCRYPTION_PREVIOUS_KEYS: Joi.string()
    .allow('')
    .pattern(ENCRYPTION_PREVIOUS_KEYS_PATTERN)
    .default(ENCRYPTION_PREVIOUS_KEYS_DEFAULT),
} as const;
