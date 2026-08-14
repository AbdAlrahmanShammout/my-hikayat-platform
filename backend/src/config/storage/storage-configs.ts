import { registerAs } from '@nestjs/config';

import { STORAGE_FORCE_PATH_STYLE_DEFAULT } from './storage-config.schema';

function readOptionalEndpoint(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const normalizedEndpoint: string = value.trim();
  if (normalizedEndpoint.length === 0) {
    return null;
  }
  return normalizedEndpoint;
}

export default [
  registerAs('storage', () => ({
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
    endpoint: readOptionalEndpoint(process.env.STORAGE_ENDPOINT),
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    forcePathStyle:
      (process.env.STORAGE_FORCE_PATH_STYLE ?? String(STORAGE_FORCE_PATH_STYLE_DEFAULT)) === 'true',
  })),
];
