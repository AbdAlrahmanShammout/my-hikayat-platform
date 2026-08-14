import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

import { StorageConfigService } from '@/config/storage/storage-config.service';
import { createS3Client } from '@/providers/storage/s3/s3-client.factory';
import { S3StorageManagerService } from '@/providers/storage/s3/s3-storage-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: createS3Client,
      inject: [StorageConfigService],
    },
    { provide: StorageManagerService, useClass: S3StorageManagerService },
  ],
  exports: [StorageManagerService],
})
export class S3StorageProviderModule {}
