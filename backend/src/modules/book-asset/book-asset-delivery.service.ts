import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BOOK_DELIVERY_GRANT } from '@/modules/book-asset/book-delivery-grant.constant';
import {
  BookAssetDeliveryGrant,
  CreateBookAssetDeliveryGrantServiceInput,
} from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetEncryptedSourceMissingException } from '@/modules/book-asset/exceptions/book-asset-encrypted-source-missing.exception';
import { BookAssetNotEncryptedException } from '@/modules/book-asset/exceptions/book-asset-not-encrypted.exception';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import { StorageSignedUrl } from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

@Injectable()
export class BookAssetDeliveryService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookAssetService: BookAssetService,
    private readonly entitlementService: EntitlementService,
    private readonly storageManagerService: StorageManagerService,
  ) {}

  async createSourceDeliveryGrant(
    input: CreateBookAssetDeliveryGrantServiceInput,
  ): Promise<BookAssetDeliveryGrant> {
    const book = await this.bookService.getCatalogBookById(input.bookId);
    await this.entitlementService.assertPaidReadingAccess(input.userId);
    const source: BookAssetEntity | null = await this.bookAssetService.findLatestBookAsset({
      bookId: book.id,
      kind: BookAssetKind.SOURCE,
    });
    if (source === null) {
      throw new BookAssetEncryptedSourceMissingException(book.id);
    }
    if (!source.isEncrypted) {
      throw new BookAssetNotEncryptedException(source.id);
    }
    const signedUrl: StorageSignedUrl = await this.storageManagerService.createSignedGetUrl({
      key: source.storageKey,
      expiresInSeconds: BOOK_DELIVERY_GRANT.expiresInSeconds,
    });
    return {
      bookId: book.id,
      bookAssetId: source.id,
      kind: source.kind,
      url: signedUrl.url,
      expiresAt: signedUrl.expiresAt,
      contentType: source.contentType,
      byteSize: source.byteSize,
      checksumSha256: source.checksumSha256,
      isEncrypted: source.isEncrypted,
    };
  }
}
