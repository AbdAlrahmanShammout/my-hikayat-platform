import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  openReadingShell,
  type OpenReadingShellResult,
} from '@/features/reader/lib/open-reading-shell';

/**
 * Opens the reading shell for a book (catalog + session + engine selection).
 */
export function useOpenReadingShell(bookId: number | null) {
  return useQuery<OpenReadingShellResult>({
    queryKey: queryKeys.reader.openShell(bookId ?? 0),
    queryFn: () => openReadingShell(bookId as number),
    enabled: bookId !== null && Number.isFinite(bookId) && bookId > 0,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}
