import { OfflineDownloadEntity } from './offline-download.entity';

describe('OfflineDownloadEntity', () => {
  it('holds the user and book identifiers', () => {
    const actualEntity = new OfflineDownloadEntity({
      id: 4,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 9,
      bookId: 12,
    });
    expect(actualEntity.userId).toBe(9);
    expect(actualEntity.bookId).toBe(12);
  });
});
