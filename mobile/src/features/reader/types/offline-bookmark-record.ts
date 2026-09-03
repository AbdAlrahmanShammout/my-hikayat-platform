export type OfflineBookmarkRecord = {
  readonly localId: string;
  readonly userId: number;
  readonly bookId: number;
  readonly serverId: number | null;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OfflineBookmarkPendingOp = {
  readonly opId: string;
  readonly userId: number;
  readonly bookId: number;
  readonly type: 'create' | 'delete';
  readonly localId: string;
  readonly serverId: number | null;
  readonly body: {
    readonly spineIndex?: number;
    readonly scrollOffset?: number;
    readonly spreadIndex?: number;
    readonly pageNumber?: number;
  } | null;
  readonly createdAt: string;
  readonly attemptCount: number;
  readonly lastAttemptAt: string | null;
  readonly lastError: string | null;
};
