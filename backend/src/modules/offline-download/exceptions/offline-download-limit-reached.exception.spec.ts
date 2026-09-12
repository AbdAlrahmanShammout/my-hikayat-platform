import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { OfflineDownloadLimitReachedException } from './offline-download-limit-reached.exception';

describe('OfflineDownloadLimitReachedException', () => {
  it('reports the download cap as a conflict', () => {
    const actualException = new OfflineDownloadLimitReachedException();
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('OFFLINE_DOWNLOAD_LIMIT_REACHED');
  });
});
