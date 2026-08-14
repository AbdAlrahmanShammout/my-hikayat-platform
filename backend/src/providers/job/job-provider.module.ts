import { Module } from '@nestjs/common';

import { MemoryJobProviderModule } from '@/providers/job/memory/memory-job-provider.module';

@Module({
  imports: [MemoryJobProviderModule],
  exports: [MemoryJobProviderModule],
})
export class JobProviderModule {}
