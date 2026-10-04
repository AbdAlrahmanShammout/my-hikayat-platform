import type { JSX, ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly breadcrumbs?: ReadonlyArray<{
    readonly label: string;
    readonly to: string;
  }>;
};

/**
 * Page title row. Admin screens use the Direction C catalog bar.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps): JSX.Element {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return (
      <AdminPageHeader
        title={title}
        description={description}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
    );
  }
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description !== undefined ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions !== undefined ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps): JSX.Element {
  return (
    <div className="-mx-4 -mt-4 mb-6 flex min-h-[52px] items-center justify-between gap-4 border-b border-border bg-card px-6 md:-mx-6 md:-mt-6">
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1 py-3">
        {breadcrumbs?.map((breadcrumb) => (
          <span key={breadcrumb.to} className="inline-flex items-center gap-1 text-xs">
            <Link
              to={breadcrumb.to}
              className="font-sans text-primary underline decoration-primary/30 underline-offset-2"
            >
              {breadcrumb.label}
            </Link>
            <span className="text-muted-foreground">&gt;</span>
          </span>
        ))}
        <h1 className="shrink-0 font-display text-base font-semibold text-foreground">{title}</h1>
        {description !== undefined ? (
          <span className="text-xs text-muted-foreground">— {description}</span>
        ) : null}
      </div>
      {actions !== undefined ? <div className="flex shrink-0 flex-wrap gap-2 py-3">{actions}</div> : null}
    </div>
  );
}
