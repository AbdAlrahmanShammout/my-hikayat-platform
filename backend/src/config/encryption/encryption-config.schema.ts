import * as Joi from 'joi';

export const ENCRYPTION_KEY_HEX_LENGTH = 64;

export const encryptionConfigSchema = {
  ENCRYPTION_KEY: Joi.string().hex().length(ENCRYPTION_KEY_HEX_LENGTH).required(),
} as const;
