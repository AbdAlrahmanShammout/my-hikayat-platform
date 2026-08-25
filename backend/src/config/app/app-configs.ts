import { registerAs } from '@nestjs/config';

import { Environment } from '@/config/environment';

import {
  APP_CHECKOUT_RETURN_ORIGINS_DEFAULT,
  APP_CORS_ORIGINS_DEFAULT,
  APP_PORT_DEFAULT,
  APP_PUBLIC_ORIGIN_DEFAULT,
} from './app-config.schema';

function parseOriginList(value: string | undefined, fallback: string): string[] {
  const rawValue: string = value ?? fallback;
  return rawValue
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);
}

export default [
  registerAs('app', () => ({
    env: process.env.APP_ENV ?? Environment.DEVELOPMENT,
    port: Number(process.env.APP_PORT ?? APP_PORT_DEFAULT),
    allowedOrigins: parseOriginList(process.env.APP_CORS_ORIGINS, APP_CORS_ORIGINS_DEFAULT),
    checkoutReturnOrigins: parseOriginList(
      process.env.APP_CHECKOUT_RETURN_ORIGINS,
      APP_CHECKOUT_RETURN_ORIGINS_DEFAULT,
    ),
    publicOrigin: process.env.APP_PUBLIC_ORIGIN ?? APP_PUBLIC_ORIGIN_DEFAULT,
  })),
];
