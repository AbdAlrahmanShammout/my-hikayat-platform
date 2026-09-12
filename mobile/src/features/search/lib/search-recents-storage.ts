import type { SearchCatalogField } from '@/features/search/api/search-catalog-books';
import {
  SEARCH_RECENTS_MAX,
  SEARCH_RECENTS_STORAGE_KEY,
} from '@/features/search/consts/search-recents.constant';
import { readLocalValue, writeLocalValue } from '@/storage/local-storage';

export type SearchRecent = {
  readonly query: string;
  readonly field: SearchCatalogField;
};

/**
 * Reads local recent catalog searches. Invalid JSON is treated as empty.
 */
export async function readSearchRecents(): Promise<SearchRecent[]> {
  const raw: string | null = await readLocalValue(SEARCH_RECENTS_STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isSearchRecent).slice(0, SEARCH_RECENTS_MAX);
  } catch {
    return [];
  }
}

/**
 * Prepends a successful search and persists at most SEARCH_RECENTS_MAX entries.
 */
export async function rememberSearchRecent(recent: SearchRecent): Promise<SearchRecent[]> {
  const query: string = recent.query.trim().replace(/\s+/g, ' ');
  if (query.length === 0) {
    return readSearchRecents();
  }
  const current: SearchRecent[] = await readSearchRecents();
  const next: SearchRecent[] = [
    { query, field: recent.field },
    ...current.filter(
      (item) => item.query !== query || item.field !== recent.field,
    ),
  ].slice(0, SEARCH_RECENTS_MAX);
  await writeLocalValue(SEARCH_RECENTS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function isSearchRecent(value: unknown): value is SearchRecent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as { query?: unknown; field?: unknown };
  return (
    typeof record.query === 'string' &&
    (record.field === 'title' || record.field === 'author' || record.field === 'publisher')
  );
}
