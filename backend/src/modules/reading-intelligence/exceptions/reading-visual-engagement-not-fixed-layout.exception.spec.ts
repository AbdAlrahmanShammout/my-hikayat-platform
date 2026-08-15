import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingVisualEngagementNotFixedLayoutException } from './reading-visual-engagement-not-fixed-layout.exception';

describe('ReadingVisualEngagementNotFixedLayoutException', () => {
  it('rejects visual engagement ingest for a reflowable book', () => {
    const actualException = new ReadingVisualEngagementNotFixedLayoutException(8);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_VISUAL_ENGAGEMENT_NOT_FIXED_LAYOUT');
  });
});
