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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAdminPlan } from '@/features/plans/hooks/use-update-admin-plan';
import {
  adminPlanEditFormSchema,
  type AdminPlanEditFormValues,
} from '@/features/plans/schemas/admin-plan-edit-form.schema';
import type { components } from '@/generated/admin';

type AdminPlanEditDialogProps = {
  readonly plan: components['schemas']['PlanResponse'];
};

/**
 * PATCH /admin/plans/:id dialog for name, description, and Stripe price.
 */
export function AdminPlanEditDialog({ plan }: AdminPlanEditDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Edit
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit plan</DialogTitle>
            <DialogDescription>
              {plan.kind === 'monthly_paid'
                ? 'Changing the Stripe price id reloads amount and currency from Stripe.'
                : 'Free plans have no Stripe price. Update the display name and description only.'}
            </DialogDescription>
          </DialogHeader>
          {isOpen ? (
            <AdminPlanEditForm
              plan={plan}
              onSuccess={() => {
                setIsOpen(false);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminPlanEditFormProps = {
  readonly plan: components['schemas']['PlanResponse'];
  readonly onSuccess: () => void;
};

function AdminPlanEditForm({ plan, onSuccess }: AdminPlanEditFormProps): JSX.Element {
  const updateMutation = useUpdateAdminPlan();
  const isPaid: boolean = plan.kind === 'monthly_paid';
  const form = useForm<AdminPlanEditFormValues>({
    resolver: zodResolver(adminPlanEditFormSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description,
      stripePriceId: plan.stripePriceId ?? '',
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          void submitEditPlan(plan, values, isPaid, updateMutation.mutateAsync, form.setError, onSuccess);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={updateMutation.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={updateMutation.isPending} rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isPaid ? (
          <FormField
            control={form.control}
            name="stripePriceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe price id</FormLabel>
                <FormControl>
                  <Input disabled={updateMutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

async function submitEditPlan(
  plan: components['schemas']['PlanResponse'],
  values: AdminPlanEditFormValues,
  isPaid: boolean,
  mutateAsync: ReturnType<typeof useUpdateAdminPlan>['mutateAsync'],
  setError: UseFormSetError<AdminPlanEditFormValues>,
  onSuccess: () => void,
): Promise<void> {
  if (isPaid && values.stripePriceId.trim().length === 0) {
    setError('stripePriceId', { message: 'Stripe price id is required' });
    return;
  }
  try {
    await mutateAsync({
      planId: plan.id,
      body: {
        name: values.name.trim(),
        description: values.description.trim(),
        ...(isPaid ? { stripePriceId: values.stripePriceId.trim() } : {}),
      },
    });
    onSuccess();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      for (const item of error.validationErrorObjects) {
        if (
          item.property === 'name' ||
          item.property === 'description' ||
          item.property === 'stripePriceId'
        ) {
          const firstConstraint: string | undefined = Object.values(item.constraints)[0];
          if (firstConstraint !== undefined) {
            setError(item.property, { message: firstConstraint });
          }
        }
      }
    }
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}
