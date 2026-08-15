import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  EndReadingSessionServiceInput,
  FindOpenReadingSessionServiceInput,
  StartReadingSessionServiceInput,
} from '@/modules/reading/defs/reading-session-service.defs';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionAlreadyEndedException } from '@/modules/reading/exceptions/reading-session-already-ended.exception';
import { ReadingSessionAlreadyOpenException } from '@/modules/reading/exceptions/reading-session-already-open.exception';
import { ReadingSessionBookLayoutUnknownException } from '@/modules/reading/exceptions/reading-session-book-layout-unknown.exception';
import { ReadingSessionInvalidPositionException } from '@/modules/reading/exceptions/reading-session-invalid-position.exception';
import { ReadingSessionInvalidTimingException } from '@/modules/reading/exceptions/reading-session-invalid-timing.exception';
import { ReadingSessionRepository } from '@/modules/reading/repository/reading-session.repository';
import { UserService } from '@/modules/user/user.service';

type ReadingPositionInput = {
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

type NormalizedReadingPosition = {
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
};

@Injectable()
export class ReadingSessionService {
  constructor(
    private readonly readingSessionRepository: ReadingSessionRepository,
    private readonly bookService: BookService,
    private readonly userService: UserService,
  ) {}

  async startReadingSession(input: StartReadingSessionServiceInput): Promise<ReadingSessionEntity> {
    await this.userService.getUserById(input.userId);
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    const layoutType: BookLayoutType = ReadingSessionService.requireLayoutType(book);
    const position: NormalizedReadingPosition = ReadingSessionService.requirePosition(
      layoutType,
      input,
    );
    const openSession: ReadingSessionEntity | null =
      await this.readingSessionRepository.findOpenByUserIdAndBookId(input.userId, input.bookId);
    if (openSession !== null) {
      throw new ReadingSessionAlreadyOpenException(input.userId, input.bookId);
    }
    return this.readingSessionRepository.create({
      userId: input.userId,
      bookId: input.bookId,
      layoutType,
      startedAt: input.startedAt ?? new Date(),
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      ...position,
    });
  }

  async endReadingSession(input: EndReadingSessionServiceInput): Promise<ReadingSessionEntity> {
    const session: ReadingSessionEntity = await this.getOwnedOpenSession(input.id, input.userId);
    const endedAt: Date = input.endedAt ?? new Date();
    ReadingSessionService.assertValidTiming(session.id, session.startedAt, {
      endedAt,
      activeDurationMs: input.activeDurationMs,
      idleDurationMs: input.idleDurationMs,
    });
    const position: Partial<NormalizedReadingPosition> = ReadingSessionService.optionalPosition(
      session.layoutType,
      input,
    );
    return this.readingSessionRepository.update({
      id: session.id,
      endedAt,
      activeDurationMs: input.activeDurationMs,
      idleDurationMs: input.idleDurationMs,
      ...position,
    });
  }

  async findReadingSessionById(id: number): Promise<ReadingSessionEntity | null> {
    return this.readingSessionRepository.findById(id);
  }

  async getReadingSessionById(id: number): Promise<ReadingSessionEntity> {
    const session: ReadingSessionEntity | null = await this.findReadingSessionById(id);
    if (session === null) {
      throw new ResourceNotFoundException('ReadingSession', id);
    }
    return session;
  }

  async findOpenReadingSessionByUserAndBook(
    input: FindOpenReadingSessionServiceInput,
  ): Promise<ReadingSessionEntity | null> {
    return this.readingSessionRepository.findOpenByUserIdAndBookId(input.userId, input.bookId);
  }

  private async getOwnedOpenSession(id: number, userId: number): Promise<ReadingSessionEntity> {
    const session: ReadingSessionEntity = await this.getReadingSessionById(id);
    if (session.userId !== userId) {
      throw new ResourceNotFoundException('ReadingSession', id);
    }
    if (session.endedAt !== null) {
      throw new ReadingSessionAlreadyEndedException(id);
    }
    return session;
  }

  private static requireLayoutType(book: BookEntity): BookLayoutType {
    if (book.layoutType === null) {
      throw new ReadingSessionBookLayoutUnknownException(book.id);
    }
    return book.layoutType;
  }

  private static optionalPosition(
    layoutType: BookLayoutType,
    input: ReadingPositionInput,
  ): Partial<NormalizedReadingPosition> {
    if (!ReadingSessionService.hasPositionFields(input)) {
      return {};
    }
    return ReadingSessionService.requirePosition(layoutType, input);
  }

  private static hasPositionFields(input: ReadingPositionInput): boolean {
    return (
      input.spineIndex !== undefined ||
      input.scrollOffset !== undefined ||
      input.spreadIndex !== undefined ||
      input.pageNumber !== undefined
    );
  }

  private static requirePosition(
    layoutType: BookLayoutType,
    input: ReadingPositionInput,
  ): NormalizedReadingPosition {
    if (layoutType === BookLayoutType.REFLOWABLE) {
      return ReadingSessionService.normalizeReflowablePosition(input);
    }
    return ReadingSessionService.normalizeFixedLayoutPosition(input);
  }

  private static normalizeReflowablePosition(
    input: ReadingPositionInput,
  ): NormalizedReadingPosition {
    if (
      !ReadingSessionService.isNonNegativeInt(input.spineIndex) ||
      !ReadingSessionService.isNonNegativeInt(input.scrollOffset) ||
      input.spreadIndex != null ||
      input.pageNumber != null
    ) {
      throw new ReadingSessionInvalidPositionException(BookLayoutType.REFLOWABLE);
    }
    return {
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      spreadIndex: null,
      pageNumber: null,
    };
  }

  private static normalizeFixedLayoutPosition(
    input: ReadingPositionInput,
  ): NormalizedReadingPosition {
    if (
      !ReadingSessionService.isNonNegativeInt(input.spreadIndex) ||
      !ReadingSessionService.isPositiveInt(input.pageNumber) ||
      input.spineIndex != null ||
      input.scrollOffset != null
    ) {
      throw new ReadingSessionInvalidPositionException(BookLayoutType.FIXED_LAYOUT);
    }
    return {
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
    };
  }

  private static assertValidTiming(
    sessionId: number,
    startedAt: Date,
    input: { endedAt: Date; activeDurationMs: number; idleDurationMs: number },
  ): void {
    if (
      input.endedAt.getTime() < startedAt.getTime() ||
      !ReadingSessionService.isNonNegativeInt(input.activeDurationMs) ||
      !ReadingSessionService.isNonNegativeInt(input.idleDurationMs)
    ) {
      throw new ReadingSessionInvalidTimingException(sessionId);
    }
  }

  private static isNonNegativeInt(value: number | null | undefined): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
  }

  private static isPositiveInt(value: number | null | undefined): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1;
  }
}
