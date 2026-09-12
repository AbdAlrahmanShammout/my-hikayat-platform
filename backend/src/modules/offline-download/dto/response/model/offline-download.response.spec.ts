import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';

import { OfflineDownloadResponse } from './offline-download.response';

describe('OfflineDownloadResponse', () => {
  it('projects user and book identifiers', () => {
    const actualResponse = new OfflineDownloadResponse(
      new OfflineDownloadEntity({
        id: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        userId: 9,
        bookId: 12,
      }),
    );
    expect(actualResponse.userId).toBe(9);
    expect(actualResponse.bookId).toBe(12);
  });
});
