import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetPage } from '@/modules/book-asset/defs/book-asset-repository.defs';
import { UploadBookCatalogMediaServiceInput } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetInvalidPreviewTypeException } from '@/modules/book-asset/exceptions/book-asset-invalid-preview-type.exception';
import { BookAssetInvalidPromoVideoTypeException } from '@/modules/book-asset/exceptions/book-asset-invalid-promo-video-type.exception';
import { PREVIEW_IMAGE_UPLOAD } from '@/modules/book-asset/preview-image-upload.constant';
import { PROMO_VIDEO_UPLOAD } from '@/modules/book-asset/promo-video-upload.constant';
import { UserRole } from '@/modules/user/enum/general.enum';
import { PutStorageObjectResult } from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

type StoreCatalogMediaInput = {
  readonly bookId: number;
  readonly kind: BookAssetKind;
  readonly keyPrefix: string;
  readonly body: Buffer;
  readonly contentType: string;
  readonly originalFileName: string | null;
  readonly existingId?: number;
};

@Injectable()
export class BookAssetCatalogMediaService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookAssetService: BookAssetService,
    private readonly storageManagerService: StorageManagerService,
  ) {}

  async uploadPreviewImage(input: UploadBookCatalogMediaServiceInput): Promise<BookAssetEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookAssetCatalogMediaService.assertCanManageMedia(book, input.actorId, input.actorRole);
    BookAssetCatalogMediaService.assertValidBody({
      body: input.body,
      maxBytes: PREVIEW_IMAGE_UPLOAD.maxBytes,
      emptyCode: 'BOOK_ASSET_EMPTY_PREVIEW',
      tooLargeCode: 'BOOK_ASSET_PREVIEW_TOO_LARGE',
      emptyMessage: 'Preview image must not be empty',
      tooLargeMessage: 'Preview image exceeds the maximum allowed size',
    });
    const contentType: string = BookAssetCatalogMediaService.resolvePreviewContentType(
      input.contentType,
      input.originalFileName,
    );
    return this.storeCatalogMedia({
      bookId: book.id,
      kind: BookAssetKind.PREVIEW_IMAGE,
      keyPrefix: `books/${book.id}/preview`,
      body: input.body,
      contentType,
      originalFileName: BookAssetCatalogMediaService.normalizeOriginalFileName(
        input.originalFileName,
      ),
    });
  }

  async uploadPromoVideo(input: UploadBookCatalogMediaServiceInput): Promise<BookAssetEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookAssetCatalogMediaService.assertCanManageMedia(book, input.actorId, input.actorRole);
    BookAssetCatalogMediaService.assertValidBody({
      body: input.body,
      maxBytes: PROMO_VIDEO_UPLOAD.maxBytes,
      emptyCode: 'BOOK_ASSET_EMPTY_PROMO_VIDEO',
      tooLargeCode: 'BOOK_ASSET_PROMO_VIDEO_TOO_LARGE',
      emptyMessage: 'Promo video must not be empty',
      tooLargeMessage: 'Promo video exceeds the maximum allowed size',
    });
    const contentType: string = BookAssetCatalogMediaService.resolvePromoVideoContentType(
      input.contentType,
      input.originalFileName,
    );
    const existingPage: BookAssetPage = await this.bookAssetService.listBookAssets({
      bookId: book.id,
      kind: BookAssetKind.PROMO_VIDEO,
      limit: 1,
      offset: 0,
    });
    const existingPromo: BookAssetEntity | undefined = existingPage.entities[0];
    return this.storeCatalogMedia({
      bookId: book.id,
      kind: BookAssetKind.PROMO_VIDEO,
      keyPrefix: `books/${book.id}/promo`,
      body: input.body,
      contentType,
      originalFileName: BookAssetCatalogMediaService.normalizeOriginalFileName(
        input.originalFileName,
      ),
      existingId: existingPromo?.id,
    });
  }

  private async storeCatalogMedia(input: StoreCatalogMediaInput): Promise<BookAssetEntity> {
    const storageKey: string = `${input.keyPrefix}/${randomUUID()}`;
    const stored: PutStorageObjectResult = await this.storageManagerService.putObject({
      key: storageKey,
      body: input.body,
      contentType: input.contentType,
    });
    const checksumSha256: string = createHash('sha256').update(input.body).digest('hex');
    if (input.existingId !== undefined) {
      return this.bookAssetService.updateBookAsset({
        id: input.existingId,
        storageKey: stored.key,
        contentType: input.contentType,
        byteSize: stored.byteSize,
        checksumSha256,
        originalFileName: input.originalFileName,
        isEncrypted: false,
      });
    }
    return this.bookAssetService.createBookAsset({
      bookId: input.bookId,
      kind: input.kind,
      storageKey: stored.key,
      contentType: input.contentType,
      byteSize: stored.byteSize,
      checksumSha256,
      originalFileName: input.originalFileName,
      isEncrypted: false,
    });
  }

  private static assertCanManageMedia(
    book: BookEntity,
    actorId: number,
    actorRole: UserRole,
  ): void {
    if (book.ownerId === actorId || actorRole === UserRole.ADMIN) {
      return;
    }
    throw new ResourceNotFoundException('Book', book.id);
  }

  private static assertValidBody(input: {
    readonly body: Buffer;
    readonly maxBytes: number;
    readonly emptyCode: string;
    readonly tooLargeCode: string;
    readonly emptyMessage: string;
    readonly tooLargeMessage: string;
  }): void {
    if (input.body.byteLength === 0) {
      throw new InvalidStateException({
        message: input.emptyMessage,
        code: input.emptyCode,
      });
    }
    if (input.body.byteLength > input.maxBytes) {
      throw new InvalidStateException({
        message: input.tooLargeMessage,
        code: input.tooLargeCode,
      });
    }
  }

  private static resolvePreviewContentType(
    contentType: string,
    originalFileName: string | null | undefined,
  ): string {
    const normalizedContentType: string = contentType.trim().toLowerCase();
    if (normalizedContentType === 'image/jpeg' || normalizedContentType === 'image/jpg') {
      return 'image/jpeg';
    }
    if (normalizedContentType === 'image/png') {
      return 'image/png';
    }
    if (normalizedContentType === 'image/webp') {
      return 'image/webp';
    }
    const normalizedName: string = (originalFileName ?? '').trim().toLowerCase();
    if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    if (normalizedName.endsWith('.png')) {
      return 'image/png';
    }
    if (normalizedName.endsWith('.webp')) {
      return 'image/webp';
    }
    throw new BookAssetInvalidPreviewTypeException();
  }

  private static resolvePromoVideoContentType(
    contentType: string,
    originalFileName: string | null | undefined,
  ): string {
    const normalizedContentType: string = contentType.trim().toLowerCase();
    if (normalizedContentType === 'video/mp4') {
      return 'video/mp4';
    }
    if (normalizedContentType === 'video/webm') {
      return 'video/webm';
    }
    const normalizedName: string = (originalFileName ?? '').trim().toLowerCase();
    if (normalizedName.endsWith('.mp4')) {
      return 'video/mp4';
    }
    if (normalizedName.endsWith('.webm')) {
      return 'video/webm';
    }
    throw new BookAssetInvalidPromoVideoTypeException();
  }

  private static normalizeOriginalFileName(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    const normalized: string = value.trim();
    if (normalized.length === 0) {
      return null;
    }
    return normalized;
  }
}
