import type { INestApplication } from '@nestjs/common';

import { BookProcessingStatusService } from '@/modules/book/book-processing-status.service';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingStatus, BookPublishingStatus } from '@/modules/book/enum/general.enum';

export async function publishTestBook(app: INestApplication, bookId: number): Promise<BookEntity> {
  const processingStatusService: BookProcessingStatusService = app.get(BookProcessingStatusService);
  const publishingStatusService: BookPublishingStatusService = app.get(BookPublishingStatusService);
  await processingStatusService.transitionProcessingStatus({
    bookId,
    to: BookProcessingStatus.PROCESSING,
  });
  await processingStatusService.transitionProcessingStatus({
    bookId,
    to: BookProcessingStatus.READY,
  });
  await publishingStatusService.transitionPublishingStatus({
    bookId,
    to: BookPublishingStatus.IN_REVIEW,
  });
  return publishingStatusService.transitionPublishingStatus({
    bookId,
    to: BookPublishingStatus.APPROVED,
    publishedAt: new Date(),
  });
}
