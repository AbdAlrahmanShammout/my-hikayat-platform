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
