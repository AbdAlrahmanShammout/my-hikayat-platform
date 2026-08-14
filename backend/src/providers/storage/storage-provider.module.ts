import { Module } from '@nestjs/common';

import { MemoryStorageProviderModule } from '@/providers/storage/memory/memory-storage-provider.module';

@Module({
  imports: [MemoryStorageProviderModule],
  exports: [MemoryStorageProviderModule],
})
export class StorageProviderModule {}
