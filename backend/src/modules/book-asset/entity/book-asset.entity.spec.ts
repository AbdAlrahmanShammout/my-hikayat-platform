import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

import { BookAssetEntity } from './book-asset.entity';

describe('BookAssetEntity', () => {
  it('holds source and processed asset metadata', () => {
    const actualEntity = new BookAssetEntity({
      id: 9,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      bookId: 8,
      kind: BookAssetKind.SOURCE,
      storageKey: 'books/8/source/original.epub',
      contentType: 'application/epub+zip',
      byteSize: 1048576,
      checksumSha256: null,
      originalFileName: 'the-last-lighthouse.epub',
      sortOrder: 0,
      isEncrypted: true,
    });
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.kind).toBe(BookAssetKind.SOURCE);
    expect(actualEntity.storageKey).toBe('books/8/source/original.epub');
    expect(actualEntity.isEncrypted).toBe(true);
  });
});
