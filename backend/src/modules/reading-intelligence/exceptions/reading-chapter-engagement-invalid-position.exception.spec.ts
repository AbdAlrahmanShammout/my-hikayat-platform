import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingChapterEngagementInvalidPositionException } from './reading-chapter-engagement-invalid-position.exception';

describe('ReadingChapterEngagementInvalidPositionException', () => {
  it('rejects a missing or invalid reflowable chapter locator', () => {
    const actualException = new ReadingChapterEngagementInvalidPositionException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_CHAPTER_ENGAGEMENT_INVALID_POSITION');
  });
});
