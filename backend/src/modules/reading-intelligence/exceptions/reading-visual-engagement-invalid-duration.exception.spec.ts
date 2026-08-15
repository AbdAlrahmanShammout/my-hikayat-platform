import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingVisualEngagementInvalidDurationException } from './reading-visual-engagement-invalid-duration.exception';

describe('ReadingVisualEngagementInvalidDurationException', () => {
  it('rejects a negative or non-integer visual engagement duration', () => {
    const actualException = new ReadingVisualEngagementInvalidDurationException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_VISUAL_ENGAGEMENT_INVALID_DURATION');
  });
});
