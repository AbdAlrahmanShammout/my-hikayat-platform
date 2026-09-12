import { OFFLINE_DOWNLOAD_MAX_ACTIVE } from './offline-download.constant';

describe('OFFLINE_DOWNLOAD_MAX_ACTIVE', () => {
  it('caps active downloads at three', () => {
    expect(OFFLINE_DOWNLOAD_MAX_ACTIVE).toBe(3);
  });
});
