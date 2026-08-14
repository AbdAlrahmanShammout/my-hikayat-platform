import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookFixedLayoutStructure } from '@/modules/book-processing/defs/book-page-repository.defs';
import { CreateBookPageTextLayerRepoInput } from '@/modules/book-processing/defs/book-page-text-layer-repository.defs';
import {
  ExtractedEpubChapter,
  ExtractedEpubFixedLayout,
  ExtractedEpubMetadata,
  ExtractedEpubPageTextLayer,
} from '@/modules/book-processing/defs/book-processing-service.defs';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookPageTextLayerEntity } from '@/modules/book-processing/entity/book-page-text-layer.entity';
import { BookSourceMetadataEntity } from '@/modules/book-processing/entity/book-source-metadata.entity';
import { EpubFixedLayoutTextHelper } from '@/modules/book-processing/epub-fixed-layout-text.helper';
import { EpubFixedLayoutHelper } from '@/modules/book-processing/epub-fixed-layout.helper';
import { EpubLayoutHelper } from '@/modules/book-processing/epub-layout.helper';
import { EpubMetadataHelper } from '@/modules/book-processing/epub-metadata.helper';
import { EpubOcfHelper, EpubOcfOpenedPackage } from '@/modules/book-processing/epub-ocf.helper';
import { EpubSpineHelper } from '@/modules/book-processing/epub-spine.helper';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { BookProcessingMissingPagesException } from '@/modules/book-processing/exceptions/book-processing-missing-pages.exception';
import { BookProcessingMissingSourceException } from '@/modules/book-processing/exceptions/book-processing-missing-source.exception';
import { BookProcessingNotFixedLayoutException } from '@/modules/book-processing/exceptions/book-processing-not-fixed-layout.exception';
import { BookProcessingNotReflowableException } from '@/modules/book-processing/exceptions/book-processing-not-reflowable.exception';
import { BookChapterRepository } from '@/modules/book-processing/repository/book-chapter.repository';
import { BookPageRepository } from '@/modules/book-processing/repository/book-page.repository';
import { BookPageTextLayerRepository } from '@/modules/book-processing/repository/book-page-text-layer.repository';
import { BookSourceMetadataRepository } from '@/modules/book-processing/repository/book-source-metadata.repository';
import { DecryptBufferResult } from '@/providers/encryption/defs/encryption-manager.defs';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { GetStorageObjectResult } from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

const EPUB_CONTENT_TYPES = new Set(['application/epub+zip', 'application/epub']);

@Injectable()
export class BookProcessingService {
  constructor(
    private readonly bookAssetService: BookAssetService,
    private readonly bookSourceMetadataRepository: BookSourceMetadataRepository,
    private readonly bookChapterRepository: BookChapterRepository,
    private readonly bookPageRepository: BookPageRepository,
    private readonly bookPageTextLayerRepository: BookPageTextLayerRepository,
    private readonly bookService: BookService,
    private readonly storageManagerService: StorageManagerService,
    private readonly encryptionManagerService: EncryptionManagerService,
  ) {}

  async validateEpubSource(bookId: number): Promise<void> {
    const plaintext: Buffer = await this.loadEpubPlaintext(bookId);
    EpubOcfHelper.validate(plaintext);
  }

  async extractEpubMetadata(bookId: number): Promise<BookSourceMetadataEntity> {
    const plaintext: Buffer = await this.loadEpubPlaintext(bookId);
    const opened: EpubOcfOpenedPackage = EpubOcfHelper.open(plaintext);
    const extracted: ExtractedEpubMetadata = EpubMetadataHelper.extract(
      opened.packageXml,
      opened.packagePath,
    );
    return this.persistExtractedMetadata(bookId, extracted);
  }

  async detectEpubLayout(bookId: number): Promise<BookEntity> {
    const plaintext: Buffer = await this.loadEpubPlaintext(bookId);
    const opened: EpubOcfOpenedPackage = EpubOcfHelper.open(plaintext);
    const layoutType: BookLayoutType = EpubLayoutHelper.detect(opened.packageXml, opened.archive);
    return this.bookService.updateBook({ id: bookId, layoutType });
  }

  async extractEpubChapters(bookId: number): Promise<BookChapterEntity[]> {
    const plaintext: Buffer = await this.loadEpubPlaintext(bookId);
    const opened: EpubOcfOpenedPackage = EpubOcfHelper.open(plaintext);
    const layoutType: BookLayoutType = EpubLayoutHelper.detect(opened.packageXml, opened.archive);
    if (layoutType === BookLayoutType.FIXED_LAYOUT) {
      throw new BookProcessingNotReflowableException(bookId);
    }
    const chapters: ExtractedEpubChapter[] = EpubSpineHelper.extract(opened);
    return this.bookChapterRepository.replaceByBookId({ bookId, chapters });
  }

  async extractEpubFixedLayout(bookId: number): Promise<BookFixedLayoutStructure> {
    const plaintext: Buffer = await this.loadEpubPlaintext(bookId);
    const opened: EpubOcfOpenedPackage = EpubOcfHelper.open(plaintext);
    const layoutType: BookLayoutType = EpubLayoutHelper.detect(opened.packageXml, opened.archive);
    if (layoutType !== BookLayoutType.FIXED_LAYOUT) {
      throw new BookProcessingNotFixedLayoutException(bookId);
    }
    const extracted: ExtractedEpubFixedLayout = EpubFixedLayoutHelper.extract(opened);
    return this.bookPageRepository.replaceByBookId({
      bookId,
      pages: extracted.pages,
      spreads: extracted.spreads,
    });
  }

  async extractEpubFixedLayoutText(bookId: number): Promise<BookPageTextLayerEntity[]> {
    const plaintext: Buffer = await this.loadEpubPlaintext(bookId);
    const opened: EpubOcfOpenedPackage = EpubOcfHelper.open(plaintext);
    const layoutType: BookLayoutType = EpubLayoutHelper.detect(opened.packageXml, opened.archive);
    if (layoutType !== BookLayoutType.FIXED_LAYOUT) {
      throw new BookProcessingNotFixedLayoutException(bookId);
    }
    const pages: BookPageEntity[] = await this.bookPageRepository.listByBookId(bookId);
    if (pages.length === 0) {
      throw new BookProcessingMissingPagesException(bookId);
    }
    const extracted: ExtractedEpubPageTextLayer[] = EpubFixedLayoutTextHelper.extract(opened);
    return this.bookPageTextLayerRepository.replaceByBookId({
      bookId,
      layers: extracted.map((layer) => BookProcessingService.toTextLayerInput(layer, pages)),
    });
  }

  private async persistExtractedMetadata(
    bookId: number,
    extracted: ExtractedEpubMetadata,
  ): Promise<BookSourceMetadataEntity> {
    const existing: BookSourceMetadataEntity | null =
      await this.bookSourceMetadataRepository.findByBookId(bookId);
    if (existing === null) {
      return this.bookSourceMetadataRepository.create({ bookId, ...extracted });
    }
    return this.bookSourceMetadataRepository.update({ id: existing.id, ...extracted });
  }

  private async loadEpubPlaintext(bookId: number): Promise<Buffer> {
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
    return BookProcessingService.readPlaintext(
      stored.body,
      source.isEncrypted,
      this.encryptionManagerService,
    );
  }

  private static toTextLayerInput(
    layer: ExtractedEpubPageTextLayer,
    pages: readonly BookPageEntity[],
  ): CreateBookPageTextLayerRepoInput {
    const matchedPage: BookPageEntity | undefined =
      pages.find((page) => page.href === layer.href) ??
      pages.find((page) => page.spineIndex === layer.spineIndex);
    if (matchedPage === undefined) {
      throw new BookProcessingInvalidEpubException(
        `text layer has no matching page: ${layer.href}`,
      );
    }
    return {
      pageId: matchedPage.id,
      contentText: layer.contentText,
      runs: layer.runs,
    };
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
