import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingChapterEngagementInvalidPositionException extends InvalidStateException {
  constructor() {
    super({
      message: 'Reading chapter engagement requires a non-negative spine index',
      code: 'READING_CHAPTER_ENGAGEMENT_INVALID_POSITION',
    });
  }
}
