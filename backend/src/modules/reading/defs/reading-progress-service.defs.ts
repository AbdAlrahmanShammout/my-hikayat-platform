export type SaveReadingProgressServiceInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly spineIndex?: number | null;
  readonly scrollOffset?: number | null;
  readonly spreadIndex?: number | null;
  readonly pageNumber?: number | null;
  readonly lastSessionAt?: Date;
};

export type FindReadingProgressServiceInput = {
  readonly userId: number;
  readonly bookId: number;
};

export type ListReadingProgressesServiceInput = {
  readonly userId: number;
  readonly bookId?: number;
  readonly updatedSince?: Date;
};
