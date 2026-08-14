import { JobNotInitializedException } from '@/providers/job/exceptions/job-not-initialized.exception';
import { JobEventHandlers } from '@/providers/job/interfaces/job-event-handlers.interface';

import { MemoryJobManagerService } from './memory-job-manager.service';

describe('MemoryJobManagerService', () => {
  it('runs the registered handler when a job is enqueued', async () => {
    const mockHandleJob: jest.Mock = jest.fn().mockResolvedValue(undefined);
    const mockEventHandlers: JobEventHandlers = { handleJob: mockHandleJob };
    const memoryJobManagerService = new MemoryJobManagerService();
    await memoryJobManagerService.initialize(mockEventHandlers);
    const actualResult = await memoryJobManagerService.enqueue({
      name: 'book.process-source',
      payload: { bookId: 8 },
    });
    expect(actualResult.name).toBe('book.process-source');
    expect(actualResult.jobId).toEqual(expect.any(String));
    expect(mockHandleJob).toHaveBeenCalledWith({
      name: 'book.process-source',
      payload: { bookId: 8 },
    });
  });

  it('rejects enqueue before handlers are registered', async () => {
    const memoryJobManagerService = new MemoryJobManagerService();
    await expect(
      memoryJobManagerService.enqueue({
        name: 'book.process-source',
        payload: { bookId: 8 },
      }),
    ).rejects.toBeInstanceOf(JobNotInitializedException);
  });
});
