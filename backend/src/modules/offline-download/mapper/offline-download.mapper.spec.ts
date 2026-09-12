import { OfflineDownloadType } from '@/modules/offline-download/types/offline-download-details-schema.type';

import { OfflineDownloadMapper } from './offline-download.mapper';

describe('OfflineDownloadMapper', () => {
  it('maps a persistence payload onto an OfflineDownloadEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const inputSchema: OfflineDownloadType = {
      id: 4,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      userId: 9,
      bookId: 12,
    };
    const actualEntity = OfflineDownloadMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(4);
    expect(actualEntity.userId).toBe(9);
    expect(actualEntity.bookId).toBe(12);
  });
});
