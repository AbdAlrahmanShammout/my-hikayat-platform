import { Module } from '@nestjs/common';

import { S3StorageProviderModule } from '@/providers/storage/s3/s3-storage-provider.module';

@Module({
  imports: [S3StorageProviderModule],
  exports: [S3StorageProviderModule],
})
export class StorageProviderModule {}
