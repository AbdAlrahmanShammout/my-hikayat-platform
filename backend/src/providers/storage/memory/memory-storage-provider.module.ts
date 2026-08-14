import { Module } from '@nestjs/common';

import { MemoryStorageManagerService } from '@/providers/storage/memory/memory-storage-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

@Module({
  providers: [{ provide: StorageManagerService, useClass: MemoryStorageManagerService }],
  exports: [StorageManagerService],
})
export class MemoryStorageProviderModule {}
