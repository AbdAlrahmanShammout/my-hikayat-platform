import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAdminPlan } from '@/features/plans/hooks/use-create-admin-plan';
import { buildCreateAdminPlanBody } from '@/features/plans/lib/build-create-admin-plan-body';
import {
  adminPlanCreateFormSchema,
  type AdminPlanCreateFormValues,
} from '@/features/plans/schemas/admin-plan-create-form.schema';

const EMPTY_CREATE_VALUES: AdminPlanCreateFormValues = {
  name: '',
  description: '',
  stripePriceId: '',
};

/**
 * POST /admin/plans dialog for registering a paid Stripe catalog plan.
 */
export function AdminPlanCreateDialog(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Create
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New paid plan</DialogTitle>
            <DialogDescription>
              Create the Product and recurring Price in Stripe first, then register the price id
              here. Amount and currency are loaded from Stripe.
            </DialogDescription>
          </DialogHeader>
          {isOpen ? (
            <AdminPlanCreateForm
              onCancel={() => setIsOpen(false)}
              onSuccess={() => setIsOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminPlanCreateFormProps = {
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
};

function AdminPlanCreateForm({ onCancel, onSuccess }: AdminPlanCreateFormProps): JSX.Element {
  const createMutation = useCreateAdminPlan();
  const form = useForm<AdminPlanCreateFormValues>({
    resolver: zodResolver(adminPlanCreateFormSchema),
    defaultValues: EMPTY_CREATE_VALUES,
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          void submitCreatePlan(values, createMutation.mutateAsync, form.setError, onSuccess);
        })}
        noValidate
      >
        {rootMessage !== undefined ? (
          <Alert variant="destructive" className="sm:col-span-2">
            <AlertDescription>{rootMessage}</AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={createMutation.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stripePriceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe price id</FormLabel>
              <FormControl>
                <Input disabled={createMutation.isPending} placeholder="price_…" {...field} />
              </FormControl>
              <FormDescription>Must be a recurring monthly price from Stripe.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={createMutation.isPending} rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

async function submitCreatePlan(
  values: AdminPlanCreateFormValues,
  mutateAsync: ReturnType<typeof useCreateAdminPlan>['mutateAsync'],
  setError: UseFormSetError<AdminPlanCreateFormValues>,
  onSuccess: () => void,
): Promise<void> {
  try {
    await mutateAsync(buildCreateAdminPlanBody(values));
    onSuccess();
  } catch (error: unknown) {
    applyPlanFieldErrors(error, setError, ['name', 'description', 'stripePriceId']);
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}

function applyPlanFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminPlanCreateFormValues>,
  properties: ReadonlyArray<'name' | 'description' | 'stripePriceId'>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (!isCreateFormProperty(item.property, properties)) {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}

function isCreateFormProperty(
  property: string,
  properties: ReadonlyArray<'name' | 'description' | 'stripePriceId'>,
): property is 'name' | 'description' | 'stripePriceId' {
  return properties.some((item) => item === property);
}
