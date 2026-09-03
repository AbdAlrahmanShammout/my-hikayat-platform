import { Injectable } from '@nestjs/common';

import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BOOK_CATALOG_COVER } from '@/modules/book-asset/book-catalog-cover.constant';
import { BookCatalogCover } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { StorageSignedUrl } from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

/**
 * Resolves catalog-safe cover URLs from preview_image assets.
 * Does not require full-book reading entitlement.
 */
@Injectable()
export class BookCatalogCoverService {
  constructor(
    private readonly bookAssetRepository: BookAssetRepository,
    private readonly storageManagerService: StorageManagerService,
  ) {}

  async toBookResponses(books: readonly BookEntity[]): Promise<BookResponse[]> {
    const coverByBookId: ReadonlyMap<number, BookCatalogCover | null> =
      await this.resolveCoverByBookId(books.map((book) => book.id));
    return books.map((book) => new BookResponse(book, coverByBookId.get(book.id) ?? null));
  }

  async resolveCoverByBookId(
    bookIds: readonly number[],
  ): Promise<ReadonlyMap<number, BookCatalogCover | null>> {
    const coverByBookId = new Map<number, BookCatalogCover | null>();
    for (const bookId of bookIds) {
      coverByBookId.set(bookId, null);
    }
    if (bookIds.length === 0) {
      return coverByBookId;
    }
    const previews: BookAssetEntity[] = await this.bookAssetRepository.findLatestByBookIdsAndKind({
      bookIds,
      kind: BookAssetKind.PREVIEW_IMAGE,
    });
    for (const preview of previews) {
      const signedUrl: StorageSignedUrl = await this.storageManagerService.createSignedGetUrl({
        key: preview.storageKey,
        expiresInSeconds: BOOK_CATALOG_COVER.expiresInSeconds,
      });
      coverByBookId.set(preview.bookId, {
        url: signedUrl.url,
        expiresAt: signedUrl.expiresAt,
        contentType: preview.contentType,
      });
    }
    return coverByBookId;
  }
}
