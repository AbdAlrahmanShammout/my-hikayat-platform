import * as Joi from 'joi';

export const STORAGE_FORCE_PATH_STYLE_DEFAULT = false;

export const storageConfigSchema = {
  STORAGE_BUCKET: Joi.string().min(1).required(),
  STORAGE_REGION: Joi.string().min(1).required(),
  STORAGE_ENDPOINT: Joi.string().uri().allow('').optional(),
  STORAGE_ACCESS_KEY_ID: Joi.string().min(1).required(),
  STORAGE_SECRET_ACCESS_KEY: Joi.string().min(1).required(),
  STORAGE_FORCE_PATH_STYLE: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(STORAGE_FORCE_PATH_STYLE_DEFAULT),
} as const;
