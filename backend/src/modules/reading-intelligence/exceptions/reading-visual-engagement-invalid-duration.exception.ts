import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingVisualEngagementInvalidDurationException extends InvalidStateException {
  constructor() {
    super({
      message: 'Reading visual engagement durations must be non-negative integers',
      code: 'READING_VISUAL_ENGAGEMENT_INVALID_DURATION',
    });
  }
}
