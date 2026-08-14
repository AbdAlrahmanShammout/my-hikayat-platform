import * as Joi from 'joi';

export const JWT_ACCESS_EXPIRES_IN_DEFAULT = '15m';
export const JWT_RECOVERY_EXPIRES_IN_DEFAULT = '1h';

export const jwtConfigSchema = {
  JWT_ACCESS_SECRET: Joi.string().min(1).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().min(1).default(JWT_ACCESS_EXPIRES_IN_DEFAULT),
  JWT_RECOVERY_SECRET: Joi.string().min(1).required(),
  JWT_RECOVERY_EXPIRES_IN: Joi.string().min(1).default(JWT_RECOVERY_EXPIRES_IN_DEFAULT),
} as const;
