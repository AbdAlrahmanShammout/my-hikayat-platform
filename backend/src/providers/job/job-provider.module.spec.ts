import { Test, TestingModule } from '@nestjs/testing';

import { JobManagerService } from '@/providers/job/job-manager.service';
import { MemoryJobManagerService } from '@/providers/job/memory/memory-job-manager.service';

import { JobProviderModule } from './job-provider.module';

describe('JobProviderModule', () => {
  it('binds the abstract manager to the in-memory implementation', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [JobProviderModule],
    }).compile();
    const actualManager: JobManagerService = moduleRef.get(JobManagerService);
    expect(actualManager).toBeInstanceOf(MemoryJobManagerService);
    await moduleRef.close();
  });
});
