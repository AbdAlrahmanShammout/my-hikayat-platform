import * as Joi from 'joi';

export const MAIL_SMTP_PORT_DEFAULT = 587;
export const MAIL_SMTP_SECURE_DEFAULT = false;

export const mailConfigSchema = {
  MAIL_FROM: Joi.string().email().required(),
  MAIL_SMTP_HOST: Joi.string().min(1).required(),
  MAIL_SMTP_PORT: Joi.number().integer().min(1).max(65535).default(MAIL_SMTP_PORT_DEFAULT),
  MAIL_SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(MAIL_SMTP_SECURE_DEFAULT),
  MAIL_SMTP_USER: Joi.string().allow('').optional(),
  MAIL_SMTP_PASSWORD: Joi.string().allow('').optional(),
} as const;
