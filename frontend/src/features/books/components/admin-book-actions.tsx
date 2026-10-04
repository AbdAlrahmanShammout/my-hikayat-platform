import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Eye, Info, RotateCcw, Trash2, X } from 'lucide-react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { AdminBookRejectDialog } from '@/features/books/components/admin-book-reject-dialog';
import { useApproveAdminBook } from '@/features/books/hooks/use-approve-admin-book';
import { useDeleteAdminBook } from '@/features/books/hooks/use-delete-admin-book';
import { useRejectAdminBook } from '@/features/books/hooks/use-reject-admin-book';
import { useRepublishAdminBook } from '@/features/books/hooks/use-republish-admin-book';
import { useUnpublishAdminBook } from '@/features/books/hooks/use-unpublish-admin-book';
import { getAdminBookActionAvailability } from '@/features/books/lib/get-admin-book-action-availability';
import type { components } from '@/generated/admin';

type BookReviewAction = 'approve' | 'reject' | 'unpublish' | 'republish' | 'delete';

type AdminBookActionsProps = {
  readonly book: components['schemas']['BookResponse'];
};

/**
 * Review and catalog actions. Disabled when displayed fields say the API will reject them.
 */
export function AdminBookActions({ book }: AdminBookActionsProps): JSX.Element {
  const navigate = useNavigate();
  const [openAction, setOpenAction] = useState<BookReviewAction | null>(null);
  const approveMutation = useApproveAdminBook();
  const rejectMutation = useRejectAdminBook();
  const unpublishMutation = useUnpublishAdminBook();
  const republishMutation = useRepublishAdminBook();
  const deleteMutation = useDeleteAdminBook();
  const availability = getAdminBookActionAvailability(book);
  const isBusy: boolean =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    unpublishMutation.isPending ||
    republishMutation.isPending ||
    deleteMutation.isPending;
  const activeError: Error | null = resolveActiveError({
    openAction,
    approveMutation,
    rejectMutation,
    unpublishMutation,
    republishMutation,
    deleteMutation,
  });
  const guardMessage: string =
    availability.approveDisabledReason ??
    'Approve requires processing status to be ready and publishing status to be in review. The backend validates this again on submit.';
  return (
    <Card className="overflow-hidden rounded-[10px] border-border/70 shadow-xs">
      <CardHeader className="p-5 pb-4">
        <div className="flex items-start gap-2">
          <div className="flex size-7 items-center justify-center rounded-sm bg-secondary">
            <Check className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="font-sans text-sm font-bold">Review Actions</CardTitle>
            <CardDescription className="text-xs">Publishing status management</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-0">
        <div className="flex flex-wrap gap-2">
        <ActionTrigger
          label="Approve"
          icon={<Check className="size-3.5" aria-hidden="true" />}
          canRun={availability.canApprove}
          disabledReason={availability.approveDisabledReason}
          isBusy={isBusy}
          variant="default"
          onClick={() => {
            approveMutation.reset();
            setOpenAction('approve');
          }}
        />
        <ActionTrigger
          label="Reject..."
          icon={<X className="size-3.5" aria-hidden="true" />}
          canRun={availability.canReject}
          disabledReason={availability.rejectDisabledReason}
          isBusy={isBusy}
          onClick={() => {
            rejectMutation.reset();
            setOpenAction('reject');
          }}
        />
        <ActionTrigger
          label="Unpublish"
          icon={<Eye className="size-3.5" aria-hidden="true" />}
          canRun={availability.canUnpublish}
          disabledReason={availability.unpublishDisabledReason}
          isBusy={isBusy}
          onClick={() => {
            unpublishMutation.reset();
            setOpenAction('unpublish');
          }}
        />
        <ActionTrigger
          label="Republish"
          icon={<RotateCcw className="size-3.5" aria-hidden="true" />}
          canRun={availability.canRepublish}
          disabledReason={availability.republishDisabledReason}
          isBusy={isBusy}
          onClick={() => {
            republishMutation.reset();
            setOpenAction('republish');
          }}
        />
        <ActionTrigger
          label="Delete"
          icon={<Trash2 className="size-3.5" aria-hidden="true" />}
          canRun={true}
          disabledReason={null}
          isBusy={isBusy}
          variant="destructive"
          onClick={() => {
            deleteMutation.reset();
            setOpenAction('delete');
          }}
        />
        </div>
        <Alert className="border-primary/30 bg-accent text-accent-foreground">
          <Info className="absolute left-3 top-3 size-4" aria-hidden="true" />
          <AlertDescription className="pl-5 text-xs leading-5">{guardMessage}</AlertDescription>
        </Alert>
        {openAction === 'reject' ? (
          <AdminBookRejectDialog
            open={true}
            isPending={rejectMutation.isPending}
            error={rejectMutation.error}
            onOpenChange={(open: boolean) => {
              if (!open) {
                setOpenAction(null);
              }
            }}
            onSubmit={async (reason: string) => {
              await rejectMutation.mutateAsync({ bookId: book.id, body: { reason } });
              setOpenAction(null);
            }}
          />
        ) : null}
        {openAction !== null && openAction !== 'reject' ? (
          <ConfirmDialog
            open={true}
            title={getActionCopy(openAction).title}
            description={getActionCopy(openAction).description}
            confirmLabel={getActionCopy(openAction).confirmLabel}
            confirmVariant={getActionCopy(openAction).confirmVariant}
            isPending={isBusy}
            errorMessage={activeError === null ? undefined : getUserFacingErrorMessage(activeError)}
            onOpenChange={(open: boolean) => {
              if (!open) {
                setOpenAction(null);
              }
            }}
            onConfirm={async () => {
              await runBookReviewAction({
                action: openAction,
                bookId: book.id,
                approveMutation,
                unpublishMutation,
                republishMutation,
                deleteMutation,
                onDeleted: () => {
                  void navigate('/admin/books');
                },
              });
              setOpenAction(null);
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActionTrigger({
  label,
  icon,
  canRun,
  disabledReason,
  isBusy,
  variant = 'outline',
  onClick,
}: {
  readonly label: string;
  readonly icon?: JSX.Element;
  readonly canRun: boolean;
  readonly disabledReason: string | null;
  readonly isBusy: boolean;
  readonly variant?: 'default' | 'outline' | 'destructive';
  readonly onClick: () => void;
}): JSX.Element {
  const button = (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={
        variant === 'destructive'
          ? 'border border-destructive/40 bg-card text-destructive hover:bg-destructive/10'
          : undefined
      }
      disabled={!canRun || isBusy}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
  if (disabledReason === null || canRun) {
    return button;
  }
  return <Tooltip label={disabledReason}>{button}</Tooltip>;
}

type ConfirmableBookReviewAction = Exclude<BookReviewAction, 'reject'>;

function getActionCopy(action: ConfirmableBookReviewAction): {
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly confirmVariant: 'default' | 'destructive';
} {
  if (action === 'approve') {
    return {
      title: 'Approve this book?',
      description: 'The API will set publishingStatus to approved and publishedAt to now.',
      confirmLabel: 'Approve',
      confirmVariant: 'default',
    };
  }
  if (action === 'unpublish') {
    return {
      title: 'Unpublish this book?',
      description:
        'publishingStatus stays approved. publishedAt is cleared so the book leaves the catalog.',
      confirmLabel: 'Unpublish',
      confirmVariant: 'default',
    };
  }
  if (action === 'republish') {
    return {
      title: 'Republish this book?',
      description: 'publishedAt is set to now. The book is not sent back through review.',
      confirmLabel: 'Republish',
      confirmVariant: 'default',
    };
  }
  return {
    title: 'Delete this book?',
    description: 'This is a soft-delete. The book will leave the admin list.',
    confirmLabel: 'Delete',
    confirmVariant: 'destructive',
  };
}

type BookReviewMutations = {
  readonly approveMutation: ReturnType<typeof useApproveAdminBook>;
  readonly rejectMutation: ReturnType<typeof useRejectAdminBook>;
  readonly unpublishMutation: ReturnType<typeof useUnpublishAdminBook>;
  readonly republishMutation: ReturnType<typeof useRepublishAdminBook>;
  readonly deleteMutation: ReturnType<typeof useDeleteAdminBook>;
};

function resolveActiveError(
  input: BookReviewMutations & { readonly openAction: BookReviewAction | null },
): Error | null {
  if (input.openAction === 'approve') {
    return input.approveMutation.error;
  }
  if (input.openAction === 'unpublish') {
    return input.unpublishMutation.error;
  }
  if (input.openAction === 'republish') {
    return input.republishMutation.error;
  }
  if (input.openAction === 'delete') {
    return input.deleteMutation.error;
  }
  return null;
}

async function runBookReviewAction(input: {
  readonly action: ConfirmableBookReviewAction;
  readonly bookId: number;
  readonly approveMutation: ReturnType<typeof useApproveAdminBook>;
  readonly unpublishMutation: ReturnType<typeof useUnpublishAdminBook>;
  readonly republishMutation: ReturnType<typeof useRepublishAdminBook>;
  readonly deleteMutation: ReturnType<typeof useDeleteAdminBook>;
  readonly onDeleted: () => void;
}): Promise<void> {
  if (input.action === 'approve') {
    await input.approveMutation.mutateAsync(input.bookId);
    return;
  }
  if (input.action === 'unpublish') {
    await input.unpublishMutation.mutateAsync(input.bookId);
    return;
  }
  if (input.action === 'republish') {
    await input.republishMutation.mutateAsync(input.bookId);
    return;
  }
  await input.deleteMutation.mutateAsync(input.bookId);
  input.onDeleted();
}
