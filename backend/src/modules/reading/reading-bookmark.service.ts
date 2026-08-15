import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkPage } from '@/modules/reading/defs/reading-bookmark-repository.defs';
import {
  CreateReadingBookmarkServiceInput,
  DeleteReadingBookmarkServiceInput,
  ListReadingBookmarksForSyncServiceInput,
  ListReadingBookmarksServiceInput,
} from '@/modules/reading/defs/reading-bookmark-service.defs';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingBookmarkBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-bookmark-book-layout-unknown.exception';
import { ReadingBookmarkInvalidPositionException } from '@/modules/reading/exceptions/reading-bookmark-invalid-position.exception';
import { ReadingBookmarkRepository } from '@/modules/reading/repository/reading-bookmark.repository';
import { UserService } from '@/modules/user/user.service';

type NormalizedReadingPosition = {
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
};

@Injectable()
export class ReadingBookmarkService {
  constructor(
    private readonly readingBookmarkRepository: ReadingBookmarkRepository,
    private readonly bookService: BookService,
    private readonly userService: UserService,
  ) {}

  async createReadingBookmark(
    input: CreateReadingBookmarkServiceInput,
  ): Promise<ReadingBookmarkEntity> {
    await this.userService.getUserById(input.userId);
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    const layoutType: BookLayoutType = ReadingBookmarkService.requireLayoutType(book);
    const position: NormalizedReadingPosition = ReadingBookmarkService.normalizePosition(
      layoutType,
      input,
    );
    return this.readingBookmarkRepository.create({
      userId: input.userId,
      bookId: input.bookId,
      layoutType,
      ...position,
    });
  }

  async listReadingBookmarks(
    input: ListReadingBookmarksServiceInput,
  ): Promise<ReadingBookmarkPage> {
    await this.bookService.getBookById(input.bookId);
    return this.readingBookmarkRepository.list({
      userId: input.userId,
      bookId: input.bookId,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async listReadingBookmarksForSync(
    input: ListReadingBookmarksForSyncServiceInput,
  ): Promise<ReadingBookmarkPage> {
    return this.readingBookmarkRepository.list({
      userId: input.userId,
      bookId: input.bookId,
      updatedSince: input.updatedSince,
    });
  }

  async findReadingBookmarkById(id: number): Promise<ReadingBookmarkEntity | null> {
    return this.readingBookmarkRepository.findById(id);
  }

  async getReadingBookmarkById(id: number): Promise<ReadingBookmarkEntity> {
    const bookmark: ReadingBookmarkEntity | null = await this.findReadingBookmarkById(id);
    if (bookmark === null) {
      throw new ResourceNotFoundException('ReadingBookmark', id);
    }
    return bookmark;
  }

  async deleteReadingBookmark(
    input: DeleteReadingBookmarkServiceInput,
  ): Promise<ReadingBookmarkEntity> {
    const bookmark: ReadingBookmarkEntity = await this.getReadingBookmarkById(input.id);
    if (bookmark.userId !== input.userId || bookmark.bookId !== input.bookId) {
      throw new ResourceNotFoundException('ReadingBookmark', input.id);
    }
    return this.readingBookmarkRepository.delete(input.id);
  }

  private static requireLayoutType(book: BookEntity): BookLayoutType {
    if (book.layoutType === null) {
      throw new ReadingBookmarkBookLayoutUnknownException(book.id);
    }
    return book.layoutType;
  }

  private static normalizePosition(
    layoutType: BookLayoutType,
    input: CreateReadingBookmarkServiceInput,
  ): NormalizedReadingPosition {
    if (layoutType === BookLayoutType.REFLOWABLE) {
      return ReadingBookmarkService.normalizeReflowablePosition(input);
    }
    return ReadingBookmarkService.normalizeFixedLayoutPosition(input);
  }

  private static normalizeReflowablePosition(
    input: CreateReadingBookmarkServiceInput,
  ): NormalizedReadingPosition {
    if (
      !ReadingBookmarkService.isNonNegativeInt(input.spineIndex) ||
      !ReadingBookmarkService.isNonNegativeInt(input.scrollOffset) ||
      input.spreadIndex != null ||
      input.pageNumber != null
    ) {
      throw new ReadingBookmarkInvalidPositionException(BookLayoutType.REFLOWABLE);
    }
    return {
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      spreadIndex: null,
      pageNumber: null,
    };
  }

  private static normalizeFixedLayoutPosition(
    input: CreateReadingBookmarkServiceInput,
  ): NormalizedReadingPosition {
    if (
      !ReadingBookmarkService.isNonNegativeInt(input.spreadIndex) ||
      !ReadingBookmarkService.isPositiveInt(input.pageNumber) ||
      input.spineIndex != null ||
      input.scrollOffset != null
    ) {
      throw new ReadingBookmarkInvalidPositionException(BookLayoutType.FIXED_LAYOUT);
    }
    return {
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
    };
  }

  private static isNonNegativeInt(value: number | null | undefined): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
  }

  private static isPositiveInt(value: number | null | undefined): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1;
  }
}
