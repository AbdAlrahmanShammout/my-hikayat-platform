import { EnqueueJobInput, EnqueueJobResult } from '@/providers/job/defs/job-manager.defs';
import { JobEventHandlers } from '@/providers/job/interfaces/job-event-handlers.interface';

export abstract class JobManagerService {
  abstract initialize(eventHandlers: JobEventHandlers): Promise<void>;
  abstract enqueue(input: EnqueueJobInput): Promise<EnqueueJobResult>;
}
