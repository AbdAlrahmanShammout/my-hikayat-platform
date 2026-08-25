import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { downloadOfflineBook } from '@/features/offline/lib/download-offline-book';
import { removeOfflineBook } from '@/features/offline/lib/remove-offline-book';

/**
 * Download or remove an offline encrypted book package.
 */
export function useOfflineBookActions(bookId: number | null): {
  readonly download: () => Promise<string | null>;
  readonly remove: () => Promise<void>;
  readonly isDownloading: boolean;
  readonly isRemoving: boolean;
  readonly actionErrorMessage: string | null;
} {
  const queryClient = useQueryClient();
  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (bookId === null) {
        throw new Error('That book link is not valid.');
      }
      await downloadOfflineBook(bookId);
    },
    onSuccess: async () => {
      await invalidateOfflineQueries(queryClient, bookId);
    },
  });
  const removeMutation = useMutation({
    mutationFn: async () => {
      if (bookId === null) {
        return;
      }
      await removeOfflineBook(bookId);
    },
    onSuccess: async () => {
      await invalidateOfflineQueries(queryClient, bookId);
    },
  });
  return {
    download: async () => {
      try {
        await downloadMutation.mutateAsync();
        return 'Download saved on this device. You can read it offline from Library.';
      } catch (error: unknown) {
        return mapOfflineActionError(error);
      }
    },
    remove: async () => {
      await removeMutation.mutateAsync();
    },
    isDownloading: downloadMutation.isPending,
    isRemoving: removeMutation.isPending,
    actionErrorMessage:
      downloadMutation.error === null && removeMutation.error === null
        ? null
        : mapOfflineActionError(downloadMutation.error ?? removeMutation.error),
  };
}

async function invalidateOfflineQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  bookId: number | null,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.offline.packages });
  if (bookId !== null) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.offline.package(bookId) });
  }
}

function mapOfflineActionError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Could not update the offline download right now.';
}
