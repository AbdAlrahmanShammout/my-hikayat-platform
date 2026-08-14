import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

import { BookAssetResponse } from './book-asset.response';

describe('BookAssetResponse', () => {
  it('projects asset metadata including encryption and storage key', () => {
    const inputEntity = new BookAssetEntity({
      id: 9,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      bookId: 8,
      kind: BookAssetKind.SOURCE,
      storageKey: 'books/8/source/original.epub',
      contentType: 'application/epub+zip',
      byteSize: 1048576,
      checksumSha256: 'a'.repeat(64),
      originalFileName: 'the-last-lighthouse.epub',
      sortOrder: 0,
      isEncrypted: true,
    });
    const actualResponse = new BookAssetResponse(inputEntity);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.kind).toBe(BookAssetKind.SOURCE);
    expect(actualResponse.storageKey).toBe('books/8/source/original.epub');
    expect(actualResponse.isEncrypted).toBe(true);
    expect(actualResponse.byteSize).toBe(1048576);
  });
});
