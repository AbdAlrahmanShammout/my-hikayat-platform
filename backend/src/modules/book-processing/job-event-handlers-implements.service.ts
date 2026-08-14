import { Injectable, OnModuleInit } from '@nestjs/common';

import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BOOK_PROCESSING_JOB } from '@/modules/book-processing/book-processing-job.constant';
import { BookProcessingOrchestrationService } from '@/modules/book-processing/book-processing-orchestration.service';
import { HandleJobInput } from '@/providers/job/defs/job-manager.defs';
import { JobEventHandlers } from '@/providers/job/interfaces/job-event-handlers.interface';
import { JobManagerService } from '@/providers/job/job-manager.service';

@Injectable()
export class JobEventHandlersImplementsService implements JobEventHandlers, OnModuleInit {
  constructor(
    private readonly jobManagerService: JobManagerService,
    private readonly bookProcessingOrchestrationService: BookProcessingOrchestrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.jobManagerService.initialize(this);
  }

  async handleJob(input: HandleJobInput): Promise<void> {
    if (input.name !== BOOK_PROCESSING_JOB.processSource) {
      return;
    }
    const bookId: unknown = input.payload.bookId;
    if (typeof bookId !== 'number' || !Number.isInteger(bookId) || bookId <= 0) {
      throw new InvalidStateException({
        message: 'Book processing job payload is invalid',
        code: 'BOOK_PROCESSING_INVALID_JOB_PAYLOAD',
      });
    }
    await this.bookProcessingOrchestrationService.executeProcessing(bookId);
  }
}
