import { requestJson } from '@/api/request-json';

export type AdminChapterEngagement = {
  readonly spineIndex: number;
  readonly title: string | null;
  readonly activeDurationMs: number;
};

export type AdminSpreadEngagement = {
  readonly spreadIndex: number;
  readonly pageNumber: number;
  readonly activeDurationMs: number;
  readonly visualSceneTimeMs: number;
};

export type AdminUserBookEngagement = {
  readonly userId: number;
  readonly bookId: number;
  readonly layoutType: 'reflowable' | 'fixed_layout' | null;
  readonly activeDurationMs: number;
  readonly chapters: readonly AdminChapterEngagement[];
  readonly spreads: readonly AdminSpreadEngagement[];
};

/**
 * Loads chapter or spread engagement for one user and book.
 * visualSceneTimeMs is unpaid and is not added to activeDurationMs.
 */
export async function getAdminUserBookEngagement(
  userId: number,
  bookId: number,
): Promise<AdminUserBookEngagement> {
  return requestJson<AdminUserBookEngagement>({
    path: `/admin/users/${userId}/books/${bookId}/engagement`,
    method: 'GET',
  });
}
