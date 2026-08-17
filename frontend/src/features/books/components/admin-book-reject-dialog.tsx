import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  adminBookRejectFormSchema,
  type AdminBookRejectFormValues,
} from '@/features/books/schemas/admin-book-reject-form.schema';

type AdminBookRejectDialogProps = {
  readonly open: boolean;
  readonly isPending: boolean;
  readonly error: Error | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (reason: string) => Promise<void>;
};

/**
 * Collects the required reason for POST /admin/books/:id/reject.
 */
export function AdminBookRejectDialog({
  open,
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: AdminBookRejectDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this book?</DialogTitle>
          <DialogDescription>
            A non-empty reason is required. The API stores it on the book_rejected audit record.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <AdminBookRejectForm
            isPending={isPending}
            error={error}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type AdminBookRejectFormProps = {
  readonly isPending: boolean;
  readonly error: Error | null;
  readonly onCancel: () => void;
  readonly onSubmit: (reason: string) => Promise<void>;
};

function AdminBookRejectForm({
  isPending,
  error,
  onCancel,
  onSubmit,
}: AdminBookRejectFormProps): JSX.Element {
  const form = useForm<AdminBookRejectFormValues>({
    resolver: zodResolver(adminBookRejectFormSchema),
    defaultValues: { reason: '' },
  });
  const rootMessage: string | undefined =
    form.formState.errors.root?.message ??
    (error === null ? undefined : getUserFacingErrorMessage(error));
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          void submitRejectReason(values, form.setError, onSubmit);
        })}
        noValidate
      >
        {rootMessage !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>{rootMessage}</AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea disabled={isPending} {...field} />
              </FormControl>
              <FormDescription>Shown later on this book rejection history.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={isPending}>
            {isPending ? 'Rejecting…' : 'Reject'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

async function submitRejectReason(
  values: AdminBookRejectFormValues,
  setError: UseFormSetError<AdminBookRejectFormValues>,
  onSubmit: (reason: string) => Promise<void>,
): Promise<void> {
  try {
    await onSubmit(values.reason);
  } catch (error: unknown) {
    applyRejectFieldErrors(error, setError);
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}

function applyRejectFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminBookRejectFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (item.property !== 'reason') {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError('reason', { message: firstConstraint });
    }
  }
}
