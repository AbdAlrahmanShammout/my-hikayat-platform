import { registerAs } from '@nestjs/config';

import { Environment } from '@/config/environment';

import { APP_CORS_ORIGINS_DEFAULT, APP_PORT_DEFAULT } from './app-config.schema';

function parseOriginList(value: string | undefined): string[] {
  const rawValue: string = value ?? APP_CORS_ORIGINS_DEFAULT;
  return rawValue
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);
}

export default [
  registerAs('app', () => ({
    env: process.env.APP_ENV ?? Environment.DEVELOPMENT,
    port: Number(process.env.APP_PORT ?? APP_PORT_DEFAULT),
    allowedOrigins: parseOriginList(process.env.APP_CORS_ORIGINS),
  })),
];
