import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
 * POST /admin/plans form for registering a paid Stripe catalog plan.
 */
export function AdminPlanCreateForm(): JSX.Element {
  const createMutation = useCreateAdminPlan();
  const [didCreate, setDidCreate] = useState<boolean>(false);
  const form = useForm<AdminPlanCreateFormValues>({
    resolver: zodResolver(adminPlanCreateFormSchema),
    defaultValues: EMPTY_CREATE_VALUES,
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>New paid plan</CardTitle>
        <CardDescription>
          Create the Product and recurring Price in Stripe first, then register the price id here.
          Amount and currency are loaded from Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {didCreate ? (
          <Alert>
            <AlertDescription>Plan created.</AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              setDidCreate(false);
              void submitCreatePlan(values, createMutation.mutateAsync, form.setError, () => {
                form.reset(EMPTY_CREATE_VALUES);
                setDidCreate(true);
              });
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
            <div className="flex items-end">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
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
