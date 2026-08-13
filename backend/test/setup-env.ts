import { Environment } from '@/config/environment';

process.env.APP_ENV = process.env.APP_ENV ?? Environment.TEST;
process.env.APP_PORT = process.env.APP_PORT ?? '3000';
process.env.APP_CORS_ORIGINS = process.env.APP_CORS_ORIGINS ?? 'http://localhost:3000';
