import { userInfo } from 'node:os';

import { Environment } from '@/config/environment';

const DEFAULT_TEST_DATABASE_URL = `postgresql://${userInfo().username}@localhost:5432/lib_app_test`;

process.env.APP_ENV = process.env.APP_ENV ?? Environment.TEST;
process.env.APP_PORT = process.env.APP_PORT ?? '3000';
process.env.APP_CORS_ORIGINS =
  process.env.APP_CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173';
process.env.APP_CHECKOUT_RETURN_ORIGINS =
  process.env.APP_CHECKOUT_RETURN_ORIGINS ??
  'reader://,http://localhost:3000,http://localhost:5173';
process.env.APP_PUBLIC_ORIGIN = process.env.APP_PUBLIC_ORIGIN ?? 'http://localhost:5173';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-jwt-access-secret-not-for-production';
process.env.JWT_RECOVERY_SECRET =
  process.env.JWT_RECOVERY_SECRET ?? 'test-jwt-recovery-secret-not-for-production';
process.env.STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? 'lib-app-test';
process.env.STORAGE_REGION = process.env.STORAGE_REGION ?? 'us-east-1';
process.env.STORAGE_ACCESS_KEY_ID =
  process.env.STORAGE_ACCESS_KEY_ID ?? 'test-storage-access-key-not-for-production';
process.env.STORAGE_SECRET_ACCESS_KEY =
  process.env.STORAGE_SECRET_ACCESS_KEY ?? 'test-storage-secret-key-not-for-production';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? 'ab'.repeat(32);
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? 'sk_test_not_for_production';
process.env.STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_test_not_for_production';
process.env.PLATFORM_CUT_PERCENT = process.env.PLATFORM_CUT_PERCENT ?? '30';
process.env.MAIL_FROM = process.env.MAIL_FROM ?? 'noreply@example.com';
process.env.MAIL_SMTP_HOST = process.env.MAIL_SMTP_HOST ?? 'localhost';
process.env.MAIL_SMTP_PORT = process.env.MAIL_SMTP_PORT ?? '1025';
process.env.MAIL_SMTP_SECURE = process.env.MAIL_SMTP_SECURE ?? 'false';
