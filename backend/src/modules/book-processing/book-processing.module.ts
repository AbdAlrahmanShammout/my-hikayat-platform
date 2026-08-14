import { Module } from '@nestjs/common';

import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

import { BookProcessingService } from './book-processing.service';

@Module({
  imports: [BookAssetModule, StorageProviderModule, EncryptionProviderModule],
  providers: [BookProcessingService],
  exports: [BookProcessingService],
})
export class BookProcessingModule {}
