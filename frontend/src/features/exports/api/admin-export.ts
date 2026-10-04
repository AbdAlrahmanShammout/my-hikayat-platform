import { requestBlob, requestJson } from '@/api/request-json';
import type { AdminExportResource } from '@/features/exports/lib/admin-export-columns';
import { toSearchParams } from '@/lib/to-search-params';

export type AdminExportRequest = {
  readonly resource: AdminExportResource;
  readonly filters?: Record<string, unknown>;
  readonly columns?: readonly string[];
  readonly selectedIds?: readonly number[];
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
};

export type AdminExportEstimate = {
  readonly resource: string;
  readonly rowCount: number;
  readonly allowedColumns: readonly string[];
  readonly exceedsLimit: boolean;
};

export type AdminExportJob = {
  readonly id: number;
  readonly resource: string;
  readonly status: string;
  readonly rowCount: number | null;
  readonly errorCode: string | null;
  readonly expiresAt: string | null;
  readonly createdAt: string;
};

export type AdminExportsPage = {
  readonly exports: readonly AdminExportJob[];
  readonly total: number;
};

/**
 * Counts rows before an export is created.
 */
export async function estimateAdminExport(body: AdminExportRequest): Promise<AdminExportEstimate> {
  return requestJson<AdminExportEstimate>({
    path: '/admin/exports/estimate',
    method: 'POST',
    body,
  });
}

/**
 * Queues a CSV export. The browser does not build the file.
 */
export async function createAdminExport(
  body: AdminExportRequest,
): Promise<{ id: number; status: string }> {
  return requestJson<{ id: number; status: string }>({
    path: '/admin/exports',
    method: 'POST',
    body,
  });
}

/**
 * Lists export jobs, newest first.
 */
export async function listAdminExports(query: {
  readonly limit?: number;
  readonly offset?: number;
}): Promise<AdminExportsPage> {
  return requestJson<AdminExportsPage>({
    path: `/admin/exports${toSearchParams(query)}`,
    method: 'GET',
  });
}

/**
 * Reads one export job.
 */
export async function getAdminExport(exportId: number): Promise<AdminExportJob> {
  return requestJson<AdminExportJob>({
    path: `/admin/exports/${exportId}`,
    method: 'GET',
  });
}

/**
 * Downloads a ready CSV from the API.
 */
export async function downloadAdminExport(
  exportId: number,
): Promise<{ blob: Blob; fileName: string }> {
  return requestBlob(`/admin/exports/${exportId}/download`);
}
