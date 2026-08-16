import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingChapterEngagementInvalidDurationException extends InvalidStateException {
  constructor() {
    super({
      message: 'Reading chapter engagement durations must be non-negative integers',
      code: 'READING_CHAPTER_ENGAGEMENT_INVALID_DURATION',
    });
  }
}
