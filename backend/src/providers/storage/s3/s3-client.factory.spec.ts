import { S3Client } from '@aws-sdk/client-s3';

import { StorageConfigService } from '@/config/storage/storage-config.service';

import { createS3Client } from './s3-client.factory';

describe('createS3Client', () => {
  it('builds a client with region, credentials, and optional endpoint', () => {
    const inputConfig = {
      region: 'auto',
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
      forcePathStyle: true,
      endpoint: 'https://storage.example.com',
    };
    const actualClient = createS3Client(inputConfig as unknown as StorageConfigService);
    expect(actualClient).toBeInstanceOf(S3Client);
    actualClient.destroy();
  });

  it('omits endpoint when it is not configured', () => {
    const inputConfig = {
      region: 'us-east-1',
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
      forcePathStyle: false,
      endpoint: null,
    };
    const actualClient = createS3Client(inputConfig as unknown as StorageConfigService);
    expect(actualClient).toBeInstanceOf(S3Client);
    actualClient.destroy();
  });
});
