export type OfflineReadingProgressRecord = {
  readonly userId: number;
  readonly bookId: number;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
  readonly updatedAt: string;
};
