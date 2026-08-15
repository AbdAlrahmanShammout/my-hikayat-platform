import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingVisualEngagementInvalidPositionException extends InvalidStateException {
  constructor() {
    super({
      message:
        'Reading visual engagement requires a non-negative spread index and a page number of at least 1',
      code: 'READING_VISUAL_ENGAGEMENT_INVALID_POSITION',
    });
  }
}
