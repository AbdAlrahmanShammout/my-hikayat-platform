import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingChapterEngagementInvalidDurationException } from './reading-chapter-engagement-invalid-duration.exception';

describe('ReadingChapterEngagementInvalidDurationException', () => {
  it('rejects a negative or non-integer chapter engagement duration', () => {
    const actualException = new ReadingChapterEngagementInvalidDurationException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_CHAPTER_ENGAGEMENT_INVALID_DURATION');
  });
});
