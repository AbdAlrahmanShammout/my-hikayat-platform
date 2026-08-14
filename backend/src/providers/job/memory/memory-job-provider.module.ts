import { Module } from '@nestjs/common';

import { JobManagerService } from '@/providers/job/job-manager.service';
import { MemoryJobManagerService } from '@/providers/job/memory/memory-job-manager.service';

@Module({
  providers: [{ provide: JobManagerService, useClass: MemoryJobManagerService }],
  exports: [JobManagerService],
})
export class MemoryJobProviderModule {}
