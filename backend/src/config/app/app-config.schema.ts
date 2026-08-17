import * as Joi from 'joi';

import { Environment } from '@/config/environment';

export const APP_PORT_DEFAULT = 3000;
export const APP_CORS_ORIGINS_DEFAULT = 'http://localhost:3000,http://localhost:5173';
export const APP_PUBLIC_ORIGIN_DEFAULT = 'http://localhost:5173';

export const appConfigSchema = {
  APP_ENV: Joi.string()
    .valid(...Object.values(Environment))
    .default(Environment.DEVELOPMENT),
  APP_PORT: Joi.number().integer().min(1).max(65535).default(APP_PORT_DEFAULT),
  APP_CORS_ORIGINS: Joi.string().default(APP_CORS_ORIGINS_DEFAULT),
  APP_PUBLIC_ORIGIN: Joi.string().uri().default(APP_PUBLIC_ORIGIN_DEFAULT),
} as const;
