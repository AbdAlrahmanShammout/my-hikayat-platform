import * as Joi from 'joi';

export const monetizationConfigSchema = {
  PLATFORM_CUT_PERCENT: Joi.number().min(0).max(100).required(),
} as const;
