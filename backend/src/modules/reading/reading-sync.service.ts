import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { ReadingBookmarkPage } from '@/modules/reading/defs/reading-bookmark-repository.defs';
import { ReadingProgressPage } from '@/modules/reading/defs/reading-progress-repository.defs';
import {
  GetReadingSyncServiceInput,
  ReadingSyncSnapshot,
} from '@/modules/reading/defs/reading-sync-service.defs';
import { ReadingBookmarkService } from '@/modules/reading/reading-bookmark.service';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class ReadingSyncService {
  constructor(
    private readonly readingProgressService: ReadingProgressService,
    private readonly readingBookmarkService: ReadingBookmarkService,
    private readonly bookService: BookService,
    private readonly userService: UserService,
  ) {}

  async getReadingSync(input: GetReadingSyncServiceInput): Promise<ReadingSyncSnapshot> {
    await this.userService.getUserById(input.userId);
    if (input.bookId !== undefined) {
      await this.bookService.getBookById(input.bookId);
    }
    const progress: ReadingProgressPage = await this.readingProgressService.listReadingProgresses({
      userId: input.userId,
      bookId: input.bookId,
      updatedSince: input.updatedSince,
    });
    const bookmarks: ReadingBookmarkPage =
      await this.readingBookmarkService.listReadingBookmarksForSync({
        userId: input.userId,
        bookId: input.bookId,
        updatedSince: input.updatedSince,
      });
    return { progress, bookmarks };
  }
}
