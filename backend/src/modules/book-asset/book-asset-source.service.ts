import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { UploadBookSourceServiceInput } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetInvalidSourceTypeException } from '@/modules/book-asset/exceptions/book-asset-invalid-source-type.exception';
import { SOURCE_FILE_UPLOAD } from '@/modules/book-asset/source-file-upload.constant';
import { UserRole } from '@/modules/user/enum/general.enum';
import { EncryptBufferResult } from '@/providers/encryption/defs/encryption-manager.defs';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { PutStorageObjectResult } from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

@Injectable()
export class BookAssetSourceService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookAssetService: BookAssetService,
    private readonly bookProcessingStatusService: BookProcessingStatusService,
    private readonly storageManagerService: StorageManagerService,
    private readonly encryptionManagerService: EncryptionManagerService,
  ) {}

  async uploadSourceFile(input: UploadBookSourceServiceInput): Promise<BookAssetEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookAssetSourceService.assertCanManageSource(book, input.actorId, input.actorRole);
    BookAssetSourceService.assertValidSourceBody(input.body);
    const contentType: string = BookAssetSourceService.resolveSourceContentType(
      input.contentType,
      input.originalFileName,
    );
    const originalFileName: string | null = BookAssetSourceService.normalizeOriginalFileName(
      input.originalFileName,
    );
    const encrypted: EncryptBufferResult = this.encryptionManagerService.encrypt({
      plaintext: input.body,
    });
    const storageKey: string = `books/${book.id}/source/${randomUUID()}`;
    const stored: PutStorageObjectResult = await this.storageManagerService.putObject({
      key: storageKey,
      body: encrypted.ciphertext,
      contentType,
    });
    const checksumSha256: string = createHash('sha256').update(encrypted.ciphertext).digest('hex');
    const asset: BookAssetEntity = await this.bookAssetService.createBookAsset({
      bookId: book.id,
      kind: BookAssetKind.SOURCE,
      storageKey: stored.key,
      contentType,
      byteSize: stored.byteSize,
      checksumSha256,
      originalFileName,
      isEncrypted: true,
    });
    await this.bookProcessingStatusService.resetProcessingStatus(book.id);
    return asset;
  }

  private static assertCanManageSource(
    book: BookEntity,
    actorId: number,
    actorRole: UserRole,
  ): void {
    if (book.ownerId === actorId || actorRole === UserRole.ADMIN) {
      return;
    }
    throw new ResourceNotFoundException('Book', book.id);
  }

  private static assertValidSourceBody(body: Buffer): void {
    if (body.byteLength === 0) {
      throw new InvalidStateException({
        message: 'Source file must not be empty',
        code: 'BOOK_ASSET_EMPTY_SOURCE',
      });
    }
    if (body.byteLength > SOURCE_FILE_UPLOAD.maxBytes) {
      throw new InvalidStateException({
        message: 'Source file exceeds the maximum allowed size',
        code: 'BOOK_ASSET_SOURCE_TOO_LARGE',
      });
    }
  }

  private static resolveSourceContentType(
    contentType: string,
    originalFileName: string | null | undefined,
  ): string {
    const normalizedContentType: string = contentType.trim().toLowerCase();
    if (
      normalizedContentType === 'application/epub+zip' ||
      normalizedContentType === 'application/epub'
    ) {
      return 'application/epub+zip';
    }
    if (normalizedContentType === 'application/pdf') {
      return 'application/pdf';
    }
    const normalizedName: string = (originalFileName ?? '').trim().toLowerCase();
    if (normalizedName.endsWith('.epub')) {
      return 'application/epub+zip';
    }
    if (normalizedName.endsWith('.pdf')) {
      return 'application/pdf';
    }
    throw new BookAssetInvalidSourceTypeException();
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
