import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  createAdminExport,
  estimateAdminExport,
  getAdminExport,
  listAdminExports,
  type AdminExportEstimate,
  type AdminExportJob,
  type AdminExportRequest,
  type AdminExportsPage,
} from '@/features/exports/api/admin-export';

const EXPORT_POLL_MS = 5000;

/**
 * Lists export jobs and refreshes while any job is still pending or processing.
 */
export function useAdminExportsList(query: {
  readonly limit?: number;
  readonly offset?: number;
}): UseQueryResult<AdminExportsPage, Error> {
  return useQuery({
    queryKey: queryKeys.admin.exports.list(query),
    queryFn: () => listAdminExports(query),
    refetchInterval: (current) => {
      const jobs: readonly AdminExportJob[] = current.state.data?.exports ?? [];
      const isActive: boolean = jobs.some(
        (job) => job.status === 'pending' || job.status === 'processing',
      );
      return isActive ? EXPORT_POLL_MS : false;
    },
  });
}

/**
 * Reads one export and refreshes until it leaves pending or processing.
 */
export function useAdminExport(
  exportId: number | null,
): UseQueryResult<AdminExportJob, Error> {
  return useQuery({
    queryKey: queryKeys.admin.exports.detail(exportId ?? 0),
    queryFn: () => getAdminExport(exportId ?? 0),
    enabled: exportId !== null,
    refetchInterval: (current) => {
      const status: string | undefined = current.state.data?.status;
      return status === 'pending' || status === 'processing' ? EXPORT_POLL_MS : false;
    },
  });
}

/**
 * POST /admin/exports/estimate mutation.
 */
export function useEstimateAdminExport(): UseMutationResult<
  AdminExportEstimate,
  Error,
  AdminExportRequest
> {
  return useMutation({ mutationFn: estimateAdminExport });
}

/**
 * POST /admin/exports mutation.
 */
export function useCreateAdminExport(): UseMutationResult<
  { id: number; status: string },
  Error,
  AdminExportRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminExport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.exports.all });
    },
  });
}
