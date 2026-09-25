import { CreateBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export type DemoPutObjectInput = {
  readonly key: string;
  readonly body: Buffer;
  readonly contentType: string;
};

/**
 * Uploads a demo object to the same S3-compatible bucket the API uses (STORAGE_*).
 * Staging/production must already have the bucket.
 */
export async function putDemoObject(input: DemoPutObjectInput): Promise<void> {
  const client: S3Client = createDemoS3Client();
  const bucket: string = readRequiredEnv('STORAGE_BUCKET');
  try {
    await ensureDevelopmentBucket(client, bucket);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        ContentLength: input.body.byteLength,
      }),
    );
  } catch (err: unknown) {
    throw new Error(formatDemoStorageError(input.key, bucket, err));
  } finally {
    client.destroy();
  }
}

async function ensureDevelopmentBucket(client: S3Client, bucket: string): Promise<void> {
  const env: string = (process.env.APP_ENV ?? 'development').trim();
  if (env === 'staging' || env === 'production') {
    return;
  }
  await client.send(new CreateBucketCommand({ Bucket: bucket })).catch(() => undefined);
}

function createDemoS3Client(): S3Client {
  const endpoint: string | undefined = process.env.STORAGE_ENDPOINT?.trim() || undefined;
  return new S3Client({
    region: readRequiredEnv('STORAGE_REGION'),
    credentials: {
      accessKeyId: readRequiredEnv('STORAGE_ACCESS_KEY_ID'),
      secretAccessKey: readRequiredEnv('STORAGE_SECRET_ACCESS_KEY'),
    },
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
    endpoint,
  });
}

function formatDemoStorageError(key: string, bucket: string, err: unknown): string {
  const endpoint: string = process.env.STORAGE_ENDPOINT?.trim() || 'AWS S3';
  const message: string = err instanceof Error ? err.message : 'unknown storage error';
  return `Could not upload ${key} to ${bucket} (${endpoint}): ${message}. Point STORAGE_* at the same S3 bucket the API uses.`;
}

function readRequiredEnv(name: string): string {
  const value: string | undefined = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required to seed demo files`);
  }
  return value;
}
