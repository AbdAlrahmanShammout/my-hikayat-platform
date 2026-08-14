import { userInfo } from 'node:os';

import { Environment } from '@/config/environment';

const DEFAULT_TEST_DATABASE_URL = `postgresql://${userInfo().username}@localhost:5432/lib_app_test`;

process.env.APP_ENV = process.env.APP_ENV ?? Environment.TEST;
process.env.APP_PORT = process.env.APP_PORT ?? '3000';
process.env.APP_CORS_ORIGINS = process.env.APP_CORS_ORIGINS ?? 'http://localhost:3000';
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
