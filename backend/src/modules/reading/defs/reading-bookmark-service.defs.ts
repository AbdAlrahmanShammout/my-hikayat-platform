export type CreateReadingBookmarkServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
};

export type ListReadingBookmarksServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type ListReadingBookmarksForSyncServiceInput = {
  readonly userId: number;
  readonly bookId?: number;
  readonly updatedSince?: Date;
};

export type DeleteReadingBookmarkServiceInput = {
  readonly id: number;
  readonly userId: number;
  readonly bookId: number;
};
