import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { PlatformCutPercentInvalidException } from './platform-cut-percent-invalid.exception';

describe('PlatformCutPercentInvalidException', () => {
  it('reports an invalid platform cut percent', () => {
    const actualException = new PlatformCutPercentInvalidException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('PLATFORM_CUT_PERCENT_INVALID');
  });
});
