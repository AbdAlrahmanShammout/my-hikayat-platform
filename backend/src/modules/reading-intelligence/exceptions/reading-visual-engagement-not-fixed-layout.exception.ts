import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingVisualEngagementNotFixedLayoutException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} is not a fixed-layout book`,
      code: 'READING_VISUAL_ENGAGEMENT_NOT_FIXED_LAYOUT',
    });
  }
}
