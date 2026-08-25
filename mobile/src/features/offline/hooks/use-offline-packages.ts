import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';

/**
 * Lists downloaded offline book packages from the on-device manifest.
 */
export function useOfflinePackages(): {
  readonly packages: readonly OfflineBookManifest[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => Promise<void>;
} {
  const query = useQuery({
    queryKey: queryKeys.offline.packages,
    queryFn: listOfflineManifests,
    staleTime: 0,
  });
  return {
    packages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: async () => {
      await query.refetch();
    },
  };
}

/**
 * Returns one offline package manifest when downloaded.
 */
export function useOfflinePackage(bookId: number | null): {
  readonly manifest: OfflineBookManifest | undefined;
  readonly isDownloaded: boolean;
  readonly isLoading: boolean;
  readonly invalidate: () => Promise<void>;
} {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.offline.package(bookId ?? 0),
    queryFn: async () => {
      const packages: readonly OfflineBookManifest[] = await listOfflineManifests();
      return packages.find((entry) => entry.bookId === bookId) ?? null;
    },
    enabled: bookId !== null && Number.isFinite(bookId) && bookId > 0,
    staleTime: 0,
  });
  return {
    manifest: query.data ?? undefined,
    isDownloaded: query.data !== null && query.data !== undefined,
    isLoading: query.isLoading,
    invalidate: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.offline.packages });
      if (bookId !== null) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.offline.package(bookId) });
      }
    },
  };
}
