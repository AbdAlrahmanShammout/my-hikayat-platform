import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BOOK_PROCESSING_JOB } from '@/modules/book-processing/book-processing-job.constant';
import { BookProcessingOrchestrationService } from '@/modules/book-processing/book-processing-orchestration.service';
import { JobManagerService } from '@/providers/job/job-manager.service';

import { JobEventHandlersImplementsService } from './job-event-handlers-implements.service';

describe('JobEventHandlersImplementsService', () => {
  let mockJobManagerService: { initialize: jest.Mock };
  let mockBookProcessingOrchestrationService: { executeProcessing: jest.Mock };
  let jobEventHandlersImplementsService: JobEventHandlersImplementsService;

  beforeEach(() => {
    mockJobManagerService = { initialize: jest.fn() };
    mockBookProcessingOrchestrationService = { executeProcessing: jest.fn() };
    jobEventHandlersImplementsService = new JobEventHandlersImplementsService(
      mockJobManagerService as unknown as JobManagerService,
      mockBookProcessingOrchestrationService as unknown as BookProcessingOrchestrationService,
    );
  });

  it('registers itself with the job manager on module init', async () => {
    await jobEventHandlersImplementsService.onModuleInit();
    expect(mockJobManagerService.initialize).toHaveBeenCalledWith(
      jobEventHandlersImplementsService,
    );
  });

  it('executes source processing for the named job', async () => {
    mockBookProcessingOrchestrationService.executeProcessing.mockResolvedValue(undefined);
    await jobEventHandlersImplementsService.handleJob({
      name: BOOK_PROCESSING_JOB.processSource,
      payload: { bookId: 8 },
    });
    expect(mockBookProcessingOrchestrationService.executeProcessing).toHaveBeenCalledWith(8);
  });

  it('ignores jobs it does not own', async () => {
    await jobEventHandlersImplementsService.handleJob({
      name: 'other.job',
      payload: { bookId: 8 },
    });
    expect(mockBookProcessingOrchestrationService.executeProcessing).not.toHaveBeenCalled();
  });

  it('rejects an invalid processing payload', async () => {
    await expect(
      jobEventHandlersImplementsService.handleJob({
        name: BOOK_PROCESSING_JOB.processSource,
        payload: { bookId: '8' },
      }),
    ).rejects.toBeInstanceOf(InvalidStateException);
    expect(mockBookProcessingOrchestrationService.executeProcessing).not.toHaveBeenCalled();
  });
});
