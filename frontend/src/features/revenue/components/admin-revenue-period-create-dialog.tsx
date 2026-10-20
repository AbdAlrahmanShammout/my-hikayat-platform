import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { Input } from '@/components/ui/input';
import { useCreateAdminRevenuePeriod } from '@/features/revenue/hooks/use-create-admin-revenue-period';
import { applyAdminFormApiError } from '@/features/revenue/lib/apply-admin-form-api-error';
import { buildCreateAdminRevenuePeriodBody } from '@/features/revenue/lib/build-create-admin-revenue-period-body';
import {
  adminCreateRevenuePeriodFormSchema,
  type AdminCreateRevenuePeriodFormValues,
} from '@/features/revenue/schemas/admin-create-revenue-period-form.schema';

/**
 * POST /admin/revenue-periods dialog. The admin picks a UTC calendar month.
 */
export function AdminRevenuePeriodCreateDialog(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Create
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New period</DialogTitle>
            <DialogDescription>
              The period is that whole UTC month, from the first instant through the last.
            </DialogDescription>
          </DialogHeader>
          {isOpen ? <AdminRevenuePeriodCreateForm onCancel={() => setIsOpen(false)} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminRevenuePeriodCreateFormProps = {
  readonly onCancel: () => void;
};

function AdminRevenuePeriodCreateForm({
  onCancel,
}: AdminRevenuePeriodCreateFormProps): JSX.Element {
  const navigate = useNavigate();
  const createMutation = useCreateAdminRevenuePeriod();
  const form = useForm<AdminCreateRevenuePeriodFormValues>({
    resolver: zodResolver(adminCreateRevenuePeriodFormSchema),
    defaultValues: {
      month: currentUtcMonthValue(),
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          void submitCreateRevenuePeriod(
            values,
            createMutation.mutateAsync,
            form.setError,
            (revenuePeriodId) => {
              void navigate(`/admin/revenue/${revenuePeriodId}`);
            },
          );
        })}
        noValidate
      >
        {rootMessage !== undefined ? (
          <Alert variant="destructive" className="md:col-span-2">
            <AlertDescription>{rootMessage}</AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Month</FormLabel>
              <FormControl>
                <Input type="month" disabled={createMutation.isPending} {...field} />
              </FormControl>
              <FormDescription>UTC calendar month.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create period'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function currentUtcMonthValue(now: Date = new Date()): string {
  const monthNumber: string = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${String(now.getUTCFullYear())}-${monthNumber}`;
}

async function submitCreateRevenuePeriod(
  values: AdminCreateRevenuePeriodFormValues,
  mutateAsync: ReturnType<typeof useCreateAdminRevenuePeriod>['mutateAsync'],
  setError: UseFormSetError<AdminCreateRevenuePeriodFormValues>,
  onCreated: (revenuePeriodId: number) => void,
): Promise<void> {
  try {
    const created = await mutateAsync(buildCreateAdminRevenuePeriodBody(values));
    onCreated(created.id);
  } catch (error: unknown) {
    applyAdminFormApiError(error, setError, ['month']);
  }
}
