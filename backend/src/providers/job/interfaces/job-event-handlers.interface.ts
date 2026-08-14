import { HandleJobInput } from '@/providers/job/defs/job-manager.defs';

export interface JobEventHandlers {
  handleJob(input: HandleJobInput): Promise<void>;
}
