import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { useCreateAdminRevenuePeriod } from '@/features/revenue/hooks/use-create-admin-revenue-period';
import { applyAdminFormApiError } from '@/features/revenue/lib/apply-admin-form-api-error';
import { buildCreateAdminRevenuePeriodBody } from '@/features/revenue/lib/build-create-admin-revenue-period-body';
import {
  adminCreateRevenuePeriodFormSchema,
  type AdminCreateRevenuePeriodFormValues,
} from '@/features/revenue/schemas/admin-create-revenue-period-form.schema';

/**
 * POST /admin/revenue-periods form. Pool is optional integer cents, not Stripe-derived.
 */
export function AdminRevenuePeriodCreateForm(): JSX.Element {
  const navigate = useNavigate();
  const createMutation = useCreateAdminRevenuePeriod();
  const form = useForm<AdminCreateRevenuePeriodFormValues>({
    resolver: zodResolver(adminCreateRevenuePeriodFormSchema),
    defaultValues: {
      startsAt: '',
      endsAt: '',
      platformCutPercent: '',
      poolAmountCents: '',
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>New period</CardTitle>
        <CardDescription>
          startsAt is inclusive UTC. endsAt is exclusive UTC. Pool is admin-set cents.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              name="startsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>startsAt</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2026-08-01T00:00:00.000Z"
                      disabled={createMutation.isPending}
                      {...field}
                      value={String(field.value)}
                    />
                  </FormControl>
                  <FormDescription>Inclusive UTC start.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>endsAt</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2026-09-01T00:00:00.000Z"
                      disabled={createMutation.isPending}
                      {...field}
                      value={String(field.value)}
                    />
                  </FormControl>
                  <FormDescription>Exclusive UTC end. Must be later than startsAt.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platformCutPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>platformCutPercent</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="Uses server config if empty"
                      disabled={createMutation.isPending}
                      {...field}
                      value={field.value === undefined ? '' : String(field.value)}
                    />
                  </FormControl>
                  <FormDescription>Optional. 0 through 100.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="poolAmountCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>poolAmountCents</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      inputMode="numeric"
                      placeholder="Leave empty to set later"
                      disabled={createMutation.isPending}
                      {...field}
                      value={field.value === undefined ? '' : String(field.value)}
                    />
                  </FormControl>
                  <FormDescription>Optional integer cents. Not derived from Stripe.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create period'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
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
    applyAdminFormApiError(error, setError, [
      'startsAt',
      'endsAt',
      'platformCutPercent',
      'poolAmountCents',
    ]);
  }
}
