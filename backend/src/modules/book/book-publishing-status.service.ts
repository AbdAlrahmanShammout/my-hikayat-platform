import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BOOK_PUBLISHING_TRANSITIONS } from '@/modules/book/book-publishing-transitions';
import { BookService } from '@/modules/book/book.service';
import {
  ChangeBookPublishingStatusServiceInput,
  TransitionBookPublishingStatusInput,
} from '@/modules/book/defs/book-service.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingStatus, BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookInvalidPublishingTransitionException } from '@/modules/book/exceptions/book-invalid-publishing-transition.exception';
import { BookNotReadyForPublishingException } from '@/modules/book/exceptions/book-not-ready-for-publishing.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';

@Injectable()
export class BookPublishingStatusService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookRepository: BookRepository,
    private readonly auditLogService: AuditLogService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async transitionPublishingStatus(
    input: TransitionBookPublishingStatusInput,
  ): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookPublishingStatusService.assertTransitionAllowed(book.publishingStatus, input.to);
    const persist = async (context?: TransactionContext): Promise<BookEntity> => {
      const updated: BookEntity = await this.bookRepository.update(
        {
          id: book.id,
          publishingStatus: input.to,
          ...(input.publishedAt !== undefined ? { publishedAt: input.publishedAt } : {}),
        },
        context,
      );
      await this.appendPublishingAudit(book, input, context);
      return updated;
    };
    if (input.actorUserId === undefined) {
      return persist();
    }
    return this.transactionRunner.run((context) => persist(context));
  }

  async approveBook(input: ChangeBookPublishingStatusServiceInput): Promise<BookEntity> {
    const book: BookEntity = await this.bookService.getBookById(input.bookId);
    BookPublishingStatusService.assertReadyForPublishing(book);
    return this.transitionPublishingStatus({
      bookId: input.bookId,
      to: BookPublishingStatus.APPROVED,
      publishedAt: new Date(),
      actorUserId: input.actorUserId,
    });
  }

  async rejectBook(input: ChangeBookPublishingStatusServiceInput): Promise<BookEntity> {
    return this.transitionPublishingStatus({
      bookId: input.bookId,
      to: BookPublishingStatus.REJECTED,
      actorUserId: input.actorUserId,
    });
  }

  private async appendPublishingAudit(
    book: BookEntity,
    input: TransitionBookPublishingStatusInput,
    context?: TransactionContext,
  ): Promise<void> {
    if (input.actorUserId === undefined) {
      return;
    }
    const action: AuditAction | null = BookPublishingStatusService.resolveAuditAction(input.to);
    if (action === null) {
      return;
    }
    await this.auditLogService.append(
      {
        actorUserId: input.actorUserId,
        action,
        subjectType: AuditSubjectType.BOOK,
        subjectId: book.id,
        metadata: {
          from: book.publishingStatus,
          to: input.to,
        },
      },
      context,
    );
  }

  private static resolveAuditAction(to: BookPublishingStatus): AuditAction | null {
    if (to === BookPublishingStatus.IN_REVIEW) {
      return AuditAction.BOOK_SUBMITTED_FOR_REVIEW;
    }
    if (to === BookPublishingStatus.APPROVED) {
      return AuditAction.BOOK_APPROVED;
    }
    if (to === BookPublishingStatus.REJECTED) {
      return AuditAction.BOOK_REJECTED;
    }
    return null;
  }

  private static assertReadyForPublishing(book: BookEntity): void {
    if (book.processingStatus === BookProcessingStatus.READY) {
      return;
    }
    throw new BookNotReadyForPublishingException(book.id);
  }

  private static assertTransitionAllowed(
    from: BookPublishingStatus,
    to: BookPublishingStatus,
  ): void {
    if (BOOK_PUBLISHING_TRANSITIONS[from].includes(to)) {
      return;
    }
    throw new BookInvalidPublishingTransitionException(from, to);
  }
}
