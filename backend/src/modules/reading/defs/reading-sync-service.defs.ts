import { ReadingBookmarkPage } from '@/modules/reading/defs/reading-bookmark-repository.defs';
import { ReadingProgressPage } from '@/modules/reading/defs/reading-progress-repository.defs';

export type GetReadingSyncServiceInput = {
  readonly userId: number;
  readonly bookId?: number;
  readonly updatedSince?: Date;
};

export type ReadingSyncSnapshot = {
  readonly progress: ReadingProgressPage;
  readonly bookmarks: ReadingBookmarkPage;
};
