import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

import { StorageConfigService } from '@/config/storage/storage-config.service';

export function createS3Client(storageConfigService: StorageConfigService): S3Client {
  const clientConfig: S3ClientConfig = {
    region: storageConfigService.region,
    credentials: {
      accessKeyId: storageConfigService.accessKeyId,
      secretAccessKey: storageConfigService.secretAccessKey,
    },
    forcePathStyle: storageConfigService.forcePathStyle,
  };
  if (storageConfigService.endpoint !== null) {
    clientConfig.endpoint = storageConfigService.endpoint;
  }
  return new S3Client(clientConfig);
}
