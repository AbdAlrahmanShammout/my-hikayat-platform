import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetType } from '@/modules/book-asset/types/book-asset-details-schema.type';

import { BookAssetMapper } from './book-asset.mapper';

describe('BookAssetMapper', () => {
  it('maps a persistence payload onto a BookAssetEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: BookAssetType = {
      id: 9,
      createdAt,
      updatedAt,
      deletedAt: null,
      bookId: 8,
      kind: 'source',
      storageKey: 'books/8/source/original.epub',
      contentType: 'application/epub+zip',
      byteSize: 1048576,
      checksumSha256: null,
      originalFileName: 'the-last-lighthouse.epub',
      sortOrder: 0,
      isEncrypted: true,
      wrappedContentKey: null,
    };
    const actualEntity = BookAssetMapper.toEntity(inputSchema);
    expect(actualEntity.kind).toBe(BookAssetKind.SOURCE);
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.storageKey).toBe('books/8/source/original.epub');
    expect(actualEntity.isEncrypted).toBe(true);
  });
});
