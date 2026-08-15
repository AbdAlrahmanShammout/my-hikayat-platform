import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { ReadingVisualEngagementInvalidPositionException } from './reading-visual-engagement-invalid-position.exception';

describe('ReadingVisualEngagementInvalidPositionException', () => {
  it('rejects a missing or invalid fixed-layout locator', () => {
    const actualException = new ReadingVisualEngagementInvalidPositionException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('READING_VISUAL_ENGAGEMENT_INVALID_POSITION');
  });
});
