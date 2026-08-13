import * as Joi from 'joi';

export const databaseConfigSchema = {
  DATABASE_URL: Joi.string().min(1).required(),
} as const;
