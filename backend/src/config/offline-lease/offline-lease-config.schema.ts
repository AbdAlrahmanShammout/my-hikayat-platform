import * as Joi from 'joi';

export const OFFLINE_LEASE_KEY_ID_DEFAULT = 'v1';
export const OFFLINE_LEASE_BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
export const OFFLINE_LEASE_KEY_ID_PATTERN = /^[A-Za-z0-9._-]{1,32}$/;

export const offlineLeaseConfigSchema = {
  OFFLINE_LEASE_PRIVATE_KEY: Joi.string().pattern(OFFLINE_LEASE_BASE64URL_PATTERN).required(),
  OFFLINE_LEASE_KEY_ID: Joi.string()
    .pattern(OFFLINE_LEASE_KEY_ID_PATTERN)
    .default(OFFLINE_LEASE_KEY_ID_DEFAULT),
} as const;
