import { Injectable } from '@nestjs/common';

import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { EpubOcfHelper } from '@/modules/book-processing/epub-ocf.helper';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { BookProcessingMissingSourceException } from '@/modules/book-processing/exceptions/book-processing-missing-source.exception';
import { DecryptBufferResult } from '@/providers/encryption/defs/encryption-manager.defs';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { GetStorageObjectResult } from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

const EPUB_CONTENT_TYPES = new Set(['application/epub+zip', 'application/epub']);

@Injectable()
export class BookProcessingService {
  constructor(
    private readonly bookAssetService: BookAssetService,
    private readonly storageManagerService: StorageManagerService,
    private readonly encryptionManagerService: EncryptionManagerService,
  ) {}

  async validateEpubSource(bookId: number): Promise<void> {
    const source: BookAssetEntity | null = await this.bookAssetService.findLatestBookAsset({
      bookId,
      kind: BookAssetKind.SOURCE,
    });
    if (source === null) {
      throw new BookProcessingMissingSourceException(bookId);
    }
    if (!BookProcessingService.isEpubSource(source)) {
      throw new BookProcessingInvalidEpubException('source file is not an EPUB');
    }
    const stored: GetStorageObjectResult = await this.storageManagerService.getObject({
      key: source.storageKey,
    });
    const plaintext: Buffer = BookProcessingService.readPlaintext(
      stored.body,
      source.isEncrypted,
      this.encryptionManagerService,
    );
    EpubOcfHelper.validate(plaintext);
  }

  private static isEpubSource(source: BookAssetEntity): boolean {
    const contentType: string = source.contentType.trim().toLowerCase();
    if (EPUB_CONTENT_TYPES.has(contentType)) {
      return true;
    }
    const fileName: string = (source.originalFileName ?? '').trim().toLowerCase();
    return fileName.endsWith('.epub');
  }

  private static readPlaintext(
    body: Buffer,
    isEncrypted: boolean,
    encryptionManagerService: EncryptionManagerService,
  ): Buffer {
    if (!isEncrypted) {
      return body;
    }
    const decrypted: DecryptBufferResult = encryptionManagerService.decrypt({ ciphertext: body });
    return decrypted.plaintext;
  }
}
