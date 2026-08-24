import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BOOK_ASSET_CHECKSUM_SHA256_LENGTH } from '@/modules/book-asset/consts';
import { BookAssetPage } from '@/modules/book-asset/defs/book-asset-repository.defs';
import {
  CreateBookAssetServiceInput,
  FindLatestBookAssetServiceInput,
  ListBookAssetsServiceInput,
  UpdateBookAssetServiceInput,
} from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';

@Injectable()
export class BookAssetService {
  constructor(
    private readonly bookAssetRepository: BookAssetRepository,
    private readonly bookService: BookService,
  ) {}

  async createBookAsset(input: CreateBookAssetServiceInput): Promise<BookAssetEntity> {
    await this.bookService.getBookById(input.bookId);
    const storageKey: string = BookAssetService.normalizeRequiredText(input.storageKey);
    const contentType: string = BookAssetService.normalizeRequiredText(input.contentType);
    const originalFileName: string | null = BookAssetService.normalizeOptionalText(
      input.originalFileName,
    );
    const checksumSha256: string | null = BookAssetService.normalizeChecksum(input.checksumSha256);
    BookAssetService.assertValidStorageKey(storageKey);
    BookAssetService.assertValidContentType(contentType);
    BookAssetService.assertValidByteSize(input.byteSize);
    BookAssetService.assertValidSortOrder(input.sortOrder ?? 0);
    BookAssetService.assertValidChecksum(checksumSha256);
    return this.bookAssetRepository.create({
      bookId: input.bookId,
      kind: input.kind,
      storageKey,
      contentType,
      byteSize: input.byteSize,
      checksumSha256,
      originalFileName,
      sortOrder: input.sortOrder ?? 0,
      isEncrypted: input.isEncrypted ?? BookAssetService.defaultIsEncrypted(input.kind),
      wrappedContentKey: input.wrappedContentKey ?? null,
    });
  }

  async updateBookAsset(input: UpdateBookAssetServiceInput): Promise<BookAssetEntity> {
    await this.getBookAssetById(input.id);
    const storageKey: string | undefined =
      input.storageKey !== undefined
        ? BookAssetService.normalizeRequiredText(input.storageKey)
        : undefined;
    const contentType: string | undefined =
      input.contentType !== undefined
        ? BookAssetService.normalizeRequiredText(input.contentType)
        : undefined;
    const originalFileName: string | null | undefined =
      input.originalFileName !== undefined
        ? BookAssetService.normalizeOptionalText(input.originalFileName)
        : undefined;
    const checksumSha256: string | null | undefined =
      input.checksumSha256 !== undefined
        ? BookAssetService.normalizeChecksum(input.checksumSha256)
        : undefined;
    if (storageKey !== undefined) {
      BookAssetService.assertValidStorageKey(storageKey);
    }
    if (contentType !== undefined) {
      BookAssetService.assertValidContentType(contentType);
    }
    if (input.byteSize !== undefined) {
      BookAssetService.assertValidByteSize(input.byteSize);
    }
    if (input.sortOrder !== undefined) {
      BookAssetService.assertValidSortOrder(input.sortOrder);
    }
    if (checksumSha256 !== undefined) {
      BookAssetService.assertValidChecksum(checksumSha256);
    }
    return this.bookAssetRepository.update({
      id: input.id,
      storageKey,
      contentType,
      byteSize: input.byteSize,
      checksumSha256,
      originalFileName,
      sortOrder: input.sortOrder,
      isEncrypted: input.isEncrypted,
      wrappedContentKey: input.wrappedContentKey,
    });
  }

  async listBookAssets(input: ListBookAssetsServiceInput): Promise<BookAssetPage> {
    await this.bookService.getBookById(input.bookId);
    return this.bookAssetRepository.list({
      bookId: input.bookId,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      kind: input.kind,
    });
  }

  async findLatestBookAsset(
    input: FindLatestBookAssetServiceInput,
  ): Promise<BookAssetEntity | null> {
    await this.bookService.getBookById(input.bookId);
    return this.bookAssetRepository.findLatestByBookIdAndKind({
      bookId: input.bookId,
      kind: input.kind,
    });
  }

  async findBookAssetById(id: number): Promise<BookAssetEntity | null> {
    return this.bookAssetRepository.findById(id);
  }

  async getBookAssetById(id: number): Promise<BookAssetEntity> {
    const bookAsset: BookAssetEntity | null = await this.findBookAssetById(id);
    if (bookAsset === null) {
      throw new ResourceNotFoundException('BookAsset', id);
    }
    return bookAsset;
  }

  private static defaultIsEncrypted(kind: BookAssetKind): boolean {
    return (
      kind === BookAssetKind.SOURCE ||
      kind === BookAssetKind.PROCESSED ||
      kind === BookAssetKind.AUDIO
    );
  }

  private static normalizeRequiredText(value: string): string {
    return value.trim();
  }

  private static normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    const normalized: string = value.trim();
    if (normalized.length === 0) {
      return null;
    }
    return normalized;
  }

  private static normalizeChecksum(value: string | null | undefined): string | null {
    const normalized: string | null = BookAssetService.normalizeOptionalText(value);
    if (normalized === null) {
      return null;
    }
    return normalized.toLowerCase();
  }

  private static assertValidStorageKey(storageKey: string): void {
    if (storageKey.length === 0) {
      throw new InvalidStateException({
        message: 'Book asset storage key must not be empty',
        code: 'BOOK_ASSET_INVALID_STORAGE_KEY',
      });
    }
  }

  private static assertValidContentType(contentType: string): void {
    if (contentType.length === 0) {
      throw new InvalidStateException({
        message: 'Book asset content type must not be empty',
        code: 'BOOK_ASSET_INVALID_CONTENT_TYPE',
      });
    }
  }

  private static assertValidByteSize(byteSize: number): void {
    if (!Number.isInteger(byteSize) || byteSize < 0) {
      throw new InvalidStateException({
        message: 'Book asset byte size must be a non-negative integer',
        code: 'BOOK_ASSET_INVALID_BYTE_SIZE',
      });
    }
  }

  private static assertValidSortOrder(sortOrder: number): void {
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new InvalidStateException({
        message: 'Book asset sort order must be a non-negative integer',
        code: 'BOOK_ASSET_INVALID_SORT_ORDER',
      });
    }
  }

  private static assertValidChecksum(checksumSha256: string | null): void {
    if (checksumSha256 === null) {
      return;
    }
    const isHexSha256: boolean =
      checksumSha256.length === BOOK_ASSET_CHECKSUM_SHA256_LENGTH &&
      /^[a-f0-9]+$/.test(checksumSha256);
    if (!isHexSha256) {
      throw new InvalidStateException({
        message: 'Book asset checksum must be a SHA-256 hex digest',
        code: 'BOOK_ASSET_INVALID_CHECKSUM',
      });
    }
  }
}
