import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import {
  FindReadingProgressServiceInput,
  ListReadingProgressesServiceInput,
  SaveReadingProgressServiceInput,
} from '@/modules/reading/defs/reading-progress-service.defs';
import { ReadingProgressPage } from '@/modules/reading/defs/reading-progress-repository.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-progress-book-layout-unknown.exception';
import { ReadingProgressInvalidPositionException } from '@/modules/reading/exceptions/reading-progress-invalid-position.exception';
import { ReadingProgressRepository } from '@/modules/reading/repository/reading-progress.repository';
import { UserService } from '@/modules/user/user.service';

type NormalizedReadingPosition = {
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
};

@Injectable()
export class ReadingProgressService {
  constructor(
    private readonly readingProgressRepository: ReadingProgressRepository,
    private readonly bookService: BookService,
    private readonly userService: UserService,
    private readonly entitlementService: EntitlementService,
  ) {}

  async saveReadingProgress(
    input: SaveReadingProgressServiceInput,
  ): Promise<ReadingProgressEntity> {
    await this.userService.getUserById(input.userId);
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    await this.entitlementService.assertCanAccessFullBook({
      userId: input.userId,
      bookId: input.bookId,
    });
    const layoutType: BookLayoutType = ReadingProgressService.requireLayoutType(book);
    const position: NormalizedReadingPosition = ReadingProgressService.normalizePosition(
      layoutType,
      input,
    );
    const lastSessionAt: Date = input.lastSessionAt ?? new Date();
    const existing: ReadingProgressEntity | null =
      await this.readingProgressRepository.findByUserIdAndBookId(input.userId, input.bookId);
    if (existing === null) {
      return this.readingProgressRepository.create({
        userId: input.userId,
        bookId: input.bookId,
        layoutType,
        lastSessionAt,
        ...position,
      });
    }
    return this.readingProgressRepository.update({
      id: existing.id,
      layoutType,
      lastSessionAt,
      ...position,
    });
  }

  async listReadingProgresses(
    input: ListReadingProgressesServiceInput,
  ): Promise<ReadingProgressPage> {
    return this.readingProgressRepository.list({
      userId: input.userId,
      bookId: input.bookId,
      updatedSince: input.updatedSince,
    });
  }

  async findReadingProgressById(id: number): Promise<ReadingProgressEntity | null> {
    return this.readingProgressRepository.findById(id);
  }

  async getReadingProgressById(id: number): Promise<ReadingProgressEntity> {
    const progress: ReadingProgressEntity | null = await this.findReadingProgressById(id);
    if (progress === null) {
      throw new ResourceNotFoundException('ReadingProgress', id);
    }
    return progress;
  }

  async findReadingProgressByUserAndBook(
    input: FindReadingProgressServiceInput,
  ): Promise<ReadingProgressEntity | null> {
    return this.readingProgressRepository.findByUserIdAndBookId(input.userId, input.bookId);
  }

  async getReadingProgressByUserAndBook(
    input: FindReadingProgressServiceInput,
  ): Promise<ReadingProgressEntity> {
    await this.bookService.getBookById(input.bookId);
    await this.entitlementService.assertCanAccessFullBook({
      userId: input.userId,
      bookId: input.bookId,
    });
    const progress: ReadingProgressEntity | null =
      await this.findReadingProgressByUserAndBook(input);
    if (progress === null) {
      throw new ResourceNotFoundException('ReadingProgress', `${input.userId}:${input.bookId}`);
    }
    return progress;
  }

  private static requireLayoutType(book: BookEntity): BookLayoutType {
    if (book.layoutType === null) {
      throw new ReadingProgressBookLayoutUnknownException(book.id);
    }
    return book.layoutType;
  }

  private static normalizePosition(
    layoutType: BookLayoutType,
    input: SaveReadingProgressServiceInput,
  ): NormalizedReadingPosition {
    if (layoutType === BookLayoutType.REFLOWABLE) {
      return ReadingProgressService.normalizeReflowablePosition(input);
    }
    return ReadingProgressService.normalizeFixedLayoutPosition(input);
  }

  private static normalizeReflowablePosition(
    input: SaveReadingProgressServiceInput,
  ): NormalizedReadingPosition {
    if (
      !ReadingProgressService.isNonNegativeInt(input.spineIndex) ||
      !ReadingProgressService.isNonNegativeInt(input.scrollOffset) ||
      input.spreadIndex != null ||
      input.pageNumber != null
    ) {
      throw new ReadingProgressInvalidPositionException(BookLayoutType.REFLOWABLE);
    }
    return {
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      spreadIndex: null,
      pageNumber: null,
    };
  }

  private static normalizeFixedLayoutPosition(
    input: SaveReadingProgressServiceInput,
  ): NormalizedReadingPosition {
    if (
      !ReadingProgressService.isNonNegativeInt(input.spreadIndex) ||
      !ReadingProgressService.isPositiveInt(input.pageNumber) ||
      input.spineIndex != null ||
      input.scrollOffset != null
    ) {
      throw new ReadingProgressInvalidPositionException(BookLayoutType.FIXED_LAYOUT);
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
