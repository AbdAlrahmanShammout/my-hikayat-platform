import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { EnqueueJobInput, EnqueueJobResult } from '@/providers/job/defs/job-manager.defs';
import { JobNotInitializedException } from '@/providers/job/exceptions/job-not-initialized.exception';
import { JobEventHandlers } from '@/providers/job/interfaces/job-event-handlers.interface';
import { JobManagerService } from '@/providers/job/job-manager.service';

@Injectable()
export class MemoryJobManagerService extends JobManagerService {
  private eventHandlers: JobEventHandlers | null = null;

  initialize(eventHandlers: JobEventHandlers): Promise<void> {
    this.eventHandlers = eventHandlers;
    return Promise.resolve();
  }

  async enqueue(input: EnqueueJobInput): Promise<EnqueueJobResult> {
    if (this.eventHandlers === null) {
      throw new JobNotInitializedException();
    }
    const jobId: string = randomUUID();
    await this.eventHandlers.handleJob({
      name: input.name,
      payload: input.payload,
    });
    return { jobId, name: input.name };
  }
}
