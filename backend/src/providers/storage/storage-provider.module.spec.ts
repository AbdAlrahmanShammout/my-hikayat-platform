import { Test, TestingModule } from '@nestjs/testing';

import { MemoryStorageManagerService } from '@/providers/storage/memory/memory-storage-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

import { StorageProviderModule } from './storage-provider.module';

describe('StorageProviderModule', () => {
  it('binds the abstract manager to the in-memory implementation', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [StorageProviderModule],
    }).compile();
    const actualManager: StorageManagerService = moduleRef.get(StorageManagerService);
    expect(actualManager).toBeInstanceOf(MemoryStorageManagerService);
    await moduleRef.close();
  });
});
