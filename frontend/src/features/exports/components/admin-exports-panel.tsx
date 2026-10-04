import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { downloadAdminExport, type AdminExportRequest } from '@/features/exports/api/admin-export';
import {
  useAdminExport,
  useAdminExportsList,
  useCreateAdminExport,
  useEstimateAdminExport,
} from '@/features/exports/hooks/use-admin-exports';
import {
  ADMIN_EXPORT_COLUMNS,
  ADMIN_EXPORT_OPTIONAL_COLUMNS,
  ADMIN_EXPORT_RESOURCES,
  ADMIN_EXPORT_ROW_LIMIT,
  type AdminExportResource,
} from '@/features/exports/lib/admin-export-columns';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { useSearchParams } from 'react-router';

type ExportDraft = {
  readonly resource: AdminExportResource;
  readonly keyword: string;
  readonly email: string;
  readonly catalogVisible: string;
  readonly status: string;
  readonly selectedIds: string;
  readonly sortBy: string;
  readonly sortOrder: string;
  readonly columns: readonly string[];
};

/**
 * Estimate, queue, poll, and download CSV exports. The file is built by the API.
 */
export function AdminExportsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const offset: number = parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0;
  const [createdId, setCreatedId] = useState<number | null>(null);
  const exportsQuery = useAdminExportsList({ limit: ADMIN_LIST_PAGE_SIZE, offset });
  const createdQuery = useAdminExport(createdId);
  return (
    <div className="space-y-8">
      <ExportCreateForm
        onCreated={(exportId: number) => {
          setCreatedId(exportId);
        }}
      />
      {createdQuery.data !== undefined ? (
        <p className="text-sm" role="status">
          {`Export ${String(createdQuery.data.id)} is ${createdQuery.data.status}.`}
        </p>
      ) : null}
      {exportsQuery.isPending ? <p className="text-sm text-muted-foreground">Loading exports…</p> : null}
      {exportsQuery.isError ? (
        <ErrorState
          message={getUserFacingErrorMessage(exportsQuery.error)}
          onRetry={() => {
            void exportsQuery.refetch();
          }}
        />
      ) : null}
      {exportsQuery.data !== undefined && exportsQuery.data.exports.length === 0 ? (
        <EmptyState title="No exports" description="Estimate a resource, then create an export." />
      ) : null}
      {exportsQuery.data !== undefined && exportsQuery.data.exports.length > 0 ? (
        <div className="space-y-4">
          <ExportJobsTable jobs={exportsQuery.data.exports} />
          <ListPagination
            offset={offset}
            limit={ADMIN_LIST_PAGE_SIZE}
            total={exportsQuery.data.total}
            onOffsetChange={(nextOffset: number) => {
              const params: URLSearchParams = new URLSearchParams();
              if (nextOffset > 0) {
                params.set('offset', String(nextOffset));
              }
              setSearchParams(params, { replace: true });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ExportCreateForm({ onCreated }: { readonly onCreated: (exportId: number) => void }): JSX.Element {
  const [draft, setDraft] = useState<ExportDraft>({
    resource: 'books',
    keyword: '',
    email: '',
    catalogVisible: '',
    status: '',
    selectedIds: '',
    sortBy: '',
    sortOrder: '',
    columns: ADMIN_EXPORT_COLUMNS.books,
  });
  const [idError, setIdError] = useState<string | undefined>(undefined);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const estimateExport = useEstimateAdminExport();
  const createExport = useCreateAdminExport();
  const requestBody: AdminExportRequest | undefined = buildExportRequest(draft);
  const estimateMatches: boolean =
    estimateExport.data !== undefined &&
    estimateExport.variables !== undefined &&
    JSON.stringify(estimateExport.variables) === JSON.stringify(requestBody);
  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="export-resource">Resource</Label>
          <Select
            id="export-resource"
            value={draft.resource}
            onChange={(event) => {
              const resource = event.target.value as AdminExportResource;
              setDraft({
                ...draft,
                resource,
                columns: ADMIN_EXPORT_COLUMNS[resource],
              });
              estimateExport.reset();
            }}
          >
            {ADMIN_EXPORT_RESOURCES.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="export-keyword">Keyword filter</Label>
          <Input
            id="export-keyword"
            value={draft.keyword}
            onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
          />
        </div>
        {draft.resource === 'users' || draft.resource === 'invitations' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-email">Exact email</Label>
            <Input
              id="export-email"
              value={draft.email}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </div>
        ) : null}
        {draft.resource === 'books' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-visible">Catalog visibility</Label>
            <Select
              id="export-visible"
              value={draft.catalogVisible}
              onChange={(event) => setDraft({ ...draft, catalogVisible: event.target.value })}
            >
              <option value="">Any</option>
              <option value="true">Catalog visible</option>
              <option value="false">Not catalog visible</option>
            </Select>
          </div>
        ) : null}
        {draft.resource === 'invitations' || draft.resource === 'subscriptions' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-status">Status</Label>
            <Input
              id="export-status"
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value })}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="export-ids">Selected ids</Label>
          <Input
            id="export-ids"
            value={draft.selectedIds}
            placeholder="12, 18"
            onChange={(event) => setDraft({ ...draft, selectedIds: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="export-sort">Sort by</Label>
          <Input
            id="export-sort"
            value={draft.sortBy}
            onChange={(event) => setDraft({ ...draft, sortBy: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="export-order">Sort order</Label>
          <Select
            id="export-order"
            value={draft.sortOrder}
            onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })}
          >
            <option value="">Default</option>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </Select>
        </div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Columns</legend>
        <div className="flex flex-wrap gap-3">
          {[...ADMIN_EXPORT_COLUMNS[draft.resource], ...ADMIN_EXPORT_OPTIONAL_COLUMNS[draft.resource]].map(
            (column) => (
              <label key={column} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.columns.includes(column)}
                  onChange={() => {
                    setDraft({
                      ...draft,
                      columns: draft.columns.includes(column)
                        ? draft.columns.filter((item) => item !== column)
                        : [...draft.columns, column],
                    });
                  }}
                />
                {column}
              </label>
            ),
          )}
        </div>
      </fieldset>
      {draft.resource === 'publishers' && draft.selectedIds.trim() !== '' ? (
        <p className="text-sm text-warning">
          Selected publisher exports return book counts as 0. Use the keyword filter when you need
          those counts.
        </p>
      ) : null}
      {idError !== undefined ? <p className="text-sm text-destructive">{idError}</p> : null}
      {estimateExport.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{getUserFacingErrorMessage(estimateExport.error)}</AlertDescription>
        </Alert>
      ) : null}
      {estimateMatches && estimateExport.data?.exceedsLimit === true ? (
        <Alert variant="destructive">
          <AlertDescription>
            {`This export has ${String(estimateExport.data.rowCount)} rows. The limit is ${String(ADMIN_EXPORT_ROW_LIMIT)}, so it cannot be created.`}
          </AlertDescription>
        </Alert>
      ) : null}
      {estimateMatches && estimateExport.data?.exceedsLimit === false ? (
        <p className="text-sm" role="status">
          {`Estimate: ${String(estimateExport.data.rowCount)} rows. You can create this export.`}
        </p>
      ) : null}
      {createExport.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{getUserFacingErrorMessage(createExport.error)}</AlertDescription>
        </Alert>
      ) : null}
      {notice !== undefined ? (
        <p className="text-sm" role="status">
          {notice}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={estimateExport.isPending}
          onClick={() => {
            const body: AdminExportRequest | undefined = buildExportRequest(draft);
            if (body === undefined) {
              setIdError('Selected ids must be positive whole numbers separated by commas.');
              return;
            }
            setIdError(undefined);
            estimateExport.mutate(body);
          }}
        >
          {estimateExport.isPending ? 'Estimating…' : 'Estimate'}
        </Button>
        <Button
          type="button"
          disabled={
            createExport.isPending ||
            !estimateMatches ||
            estimateExport.data?.exceedsLimit !== false ||
            requestBody === undefined
          }
          onClick={() => {
            if (requestBody === undefined) {
              return;
            }
            createExport.mutate(requestBody, {
              onSuccess: (created) => {
                setNotice(`Export ${String(created.id)} is ${created.status}.`);
                onCreated(created.id);
              },
            });
          }}
        >
          {createExport.isPending ? 'Creating…' : 'Create export'}
        </Button>
      </div>
    </form>
  );
}

function ExportJobsTable({
  jobs,
}: {
  readonly jobs: ReadonlyArray<{
    readonly id: number;
    readonly resource: string;
    readonly status: string;
    readonly rowCount: number | null;
    readonly errorCode: string | null;
    readonly expiresAt: string | null;
    readonly createdAt: string;
  }>;
}): JSX.Element {
  const [downloadError, setDownloadError] = useState<string | undefined>(undefined);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {downloadError !== undefined ? <p className="text-sm text-destructive">{downloadError}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Export</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rows</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.id}</TableCell>
              <TableCell>{job.resource}</TableCell>
              <TableCell>{formatExportStatus(job.status, job.errorCode)}</TableCell>
              <TableCell>{job.rowCount === null ? 'Not ready' : String(job.rowCount)}</TableCell>
              <TableCell>{formatWireInstant(job.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={job.status !== 'ready' || downloadingId === job.id}
                  onClick={() => {
                    setDownloadingId(job.id);
                    void downloadAdminExport(job.id)
                      .then((file) => {
                        saveBlob(file.blob, file.fileName);
                        setDownloadError(undefined);
                      })
                      .catch((error: unknown) => {
                        setDownloadError(getUserFacingErrorMessage(error));
                      })
                      .finally(() => {
                        setDownloadingId(null);
                      });
                  }}
                >
                  {downloadingId === job.id ? 'Downloading…' : 'Download'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function buildExportRequest(draft: ExportDraft): AdminExportRequest | undefined {
  const selectedIds: number[] | undefined = parseSelectedIds(draft.selectedIds);
  if (selectedIds === undefined) {
    return undefined;
  }
  const filters: Record<string, unknown> = {};
  if (selectedIds.length === 0) {
    const keyword: string = draft.keyword.trim();
    if (
      keyword.length >= 2 &&
      (draft.resource === 'users' || draft.resource === 'books' || draft.resource === 'publishers')
    ) {
      filters.q = keyword;
    }
    if (draft.email.trim() !== '' && (draft.resource === 'users' || draft.resource === 'invitations')) {
      filters.email = draft.email.trim();
    }
    if (
      draft.resource === 'books' &&
      (draft.catalogVisible === 'true' || draft.catalogVisible === 'false')
    ) {
      filters.catalogVisible = draft.catalogVisible === 'true';
    }
    if (
      draft.status.trim() !== '' &&
      (draft.resource === 'invitations' || draft.resource === 'subscriptions')
    ) {
      filters.status = draft.status.trim();
    }
  }
  return {
    resource: draft.resource,
    filters: Object.keys(filters).length === 0 ? undefined : filters,
    columns: draft.columns,
    selectedIds: selectedIds.length === 0 ? undefined : selectedIds,
    sortBy: draft.sortBy.trim() === '' ? undefined : draft.sortBy.trim(),
    sortOrder: draft.sortOrder === 'asc' || draft.sortOrder === 'desc' ? draft.sortOrder : undefined,
  };
}

function parseSelectedIds(value: string): number[] | undefined {
  const trimmed: string = value.trim();
  if (trimmed === '') {
    return [];
  }
  const ids: number[] = [];
  for (const part of trimmed.split(',')) {
    const token: string = part.trim();
    if (!/^[1-9]\d*$/.test(token)) {
      return undefined;
    }
    ids.push(Number.parseInt(token, 10));
  }
  return ids;
}

function formatExportStatus(status: string, errorCode: string | null): string {
  if (status === 'failed' && errorCode !== null) {
    return `failed (${errorCode})`;
  }
  return status;
}

function saveBlob(blob: Blob, fileName: string): void {
  const url: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
