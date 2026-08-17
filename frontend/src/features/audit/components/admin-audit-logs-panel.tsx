import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminAuditLogsFilters } from '@/features/audit/components/admin-audit-logs-filters';
import { AdminAuditLogsTable } from '@/features/audit/components/admin-audit-logs-table';
import { AdminAuditLogsTableSkeleton } from '@/features/audit/components/admin-audit-logs-table-skeleton';
import { useAdminAuditLogsList } from '@/features/audit/hooks/use-admin-audit-logs-list';
import {
  parseAdminAuditLogsListSearch,
  type AdminAuditLogsListSearch,
} from '@/features/audit/lib/parse-admin-audit-logs-list-search';

/**
 * Filterable GET /admin/audit-logs table with server-side paging.
 */
export function AdminAuditLogsPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminAuditLogsListSearch = parseAdminAuditLogsListSearch(searchParams);
  const auditLogsQuery = useAdminAuditLogsList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    actorUserId: listSearch.actorUserId,
    action: listSearch.action,
    subjectType: listSearch.subjectType,
    subjectId: listSearch.subjectId,
  });
  const replaceSearch = (nextSearch: AdminAuditLogsListSearch): void => {
    setSearchParams(buildListSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          This log is append-only and read-only. Metadata PATCH and category-weight PATCH are not
          required audit events.
        </AlertDescription>
      </Alert>
      <AdminAuditLogsFilters value={listSearch} onChange={replaceSearch} />
      {renderAuditLogsPanelBody(auditLogsQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderAuditLogsPanelBody(
  auditLogsQuery: ReturnType<typeof useAdminAuditLogsList>,
  listSearch: AdminAuditLogsListSearch,
  replaceSearch: (nextSearch: AdminAuditLogsListSearch) => void,
): JSX.Element {
  if (auditLogsQuery.isPending) {
    return <AdminAuditLogsTableSkeleton />;
  }
  if (auditLogsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(auditLogsQuery.error)}
        onRetry={() => {
          void auditLogsQuery.refetch();
        }}
      />
    );
  }
  if (auditLogsQuery.data.auditLogs.length === 0) {
    return (
      <EmptyState
        title="No audit entries match this filter"
        description={
          hasActiveAuditFilters(listSearch)
            ? 'Try another actor, action, or subject.'
            : 'GET /admin/audit-logs returned an empty list.'
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <AdminAuditLogsTable auditLogs={auditLogsQuery.data.auditLogs} />
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={auditLogsQuery.data.total}
        onOffsetChange={(offset: number) => {
          replaceSearch({ ...listSearch, offset });
        }}
      />
    </div>
  );
}

function hasActiveAuditFilters(search: AdminAuditLogsListSearch): boolean {
  return (
    search.actorUserId !== undefined ||
    search.action !== undefined ||
    search.subjectType !== undefined ||
    search.subjectId !== undefined
  );
}

function buildListSearchParams(search: AdminAuditLogsListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.actorUserId !== undefined) {
    params.set('actorUserId', String(search.actorUserId));
  }
  if (search.action !== undefined) {
    params.set('action', search.action);
  }
  if (search.subjectType !== undefined) {
    params.set('subjectType', search.subjectType);
  }
  if (search.subjectId !== undefined) {
    params.set('subjectId', String(search.subjectId));
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
