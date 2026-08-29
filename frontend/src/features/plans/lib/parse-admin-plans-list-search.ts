export type AdminPlansListSearch = {
  readonly offset: number;
};

/**
 * Reads list paging from the plans page URL search params.
 */
export function parseAdminPlansListSearch(searchParams: URLSearchParams): AdminPlansListSearch {
  const rawOffset: string | null = searchParams.get('offset');
  if (rawOffset === null || rawOffset === '') {
    return { offset: 0 };
  }
  const offset: number = Number.parseInt(rawOffset, 10);
  if (!Number.isInteger(offset) || offset < 0) {
    return { offset: 0 };
  }
  return { offset };
}
