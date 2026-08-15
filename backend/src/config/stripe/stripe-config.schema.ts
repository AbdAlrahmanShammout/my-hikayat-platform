import * as Joi from 'joi';

export const stripeConfigSchema = {
  STRIPE_SECRET_KEY: Joi.string().min(1).required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().min(1).required(),
  STRIPE_PRICE_ID: Joi.string().min(1).required(),
} as const;
