import { zodResolver } from '@hookform/resolvers/zod';
import type { ChangeEvent, JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

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
import { useUpdateAdminRevenuePeriod } from '@/features/revenue/hooks/use-update-admin-revenue-period';
import { applyAdminFormApiError } from '@/features/revenue/lib/apply-admin-form-api-error';
import { buildAdminRevenuePeriodUpdateBody } from '@/features/revenue/lib/build-admin-revenue-period-update-body';
import { formatPoolAmountLabel } from '@/features/revenue/lib/format-pool-amount-label';
import { getAdminRevenuePeriodActionAvailability } from '@/features/revenue/lib/get-admin-revenue-period-action-availability';
import { parseWireCents } from '@/features/revenue/lib/parse-wire-cents';
import {
  adminUpdateRevenuePeriodFormSchema,
  type AdminUpdateRevenuePeriodFormValues,
} from '@/features/revenue/schemas/admin-update-revenue-period-form.schema';
import type { components } from '@/generated/admin';

type AdminRevenuePeriodPoolFormProps = {
  readonly period: components['schemas']['RevenuePeriodResponse'];
};

/**
 * PATCH /admin/revenue-periods/:id. Pool cents always; platform cut only while open.
 */
export function AdminRevenuePeriodPoolForm({
  period,
}: AdminRevenuePeriodPoolFormProps): JSX.Element {
  const updateMutation = useUpdateAdminRevenuePeriod();
  const availability = getAdminRevenuePeriodActionAvailability(period);
  const form = useForm<AdminUpdateRevenuePeriodFormValues>({
    resolver: zodResolver(adminUpdateRevenuePeriodFormSchema),
    defaultValues: {
      platformCutPercent: period.platformCutPercent,
      poolAmountCents: parseWireCents(period.poolAmountCents) ?? undefined,
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  const watchedValues: AdminUpdateRevenuePeriodFormValues = form.watch();
  const isUnchanged: boolean =
    buildAdminRevenuePeriodUpdateBody({ period, values: watchedValues }) === null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool and platform cut</CardTitle>
        <CardDescription>
          Current pool: {formatPoolAmountLabel(period.poolAmountCents)}. Cut cannot change after
          close. This form does not derive the pool from Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitRevenuePeriodUpdate(
                period,
                values,
                updateMutation.mutateAsync,
                form.setError,
              );
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            {updateMutation.isSuccess && isUnchanged ? (
              <Alert>
                <AlertDescription>Period saved.</AlertDescription>
              </Alert>
            ) : null}
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
                      disabled={updateMutation.isPending || !availability.canEditPlatformCut}
                      {...field}
                      value={Number.isFinite(field.value) ? field.value : ''}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        applyOptionalNumberInput(event, field.onChange);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {availability.platformCutDisabledReason ?? '0 through 100.'}
                  </FormDescription>
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
                      disabled={updateMutation.isPending}
                      {...field}
                      value={Number.isFinite(field.value) ? field.value : ''}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        applyOptionalNumberInput(event, field.onChange);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Integer cents. Empty leaves the current pool unchanged.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending || isUnchanged}>
              {updateMutation.isPending ? 'Saving…' : 'Save pool and cut'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function applyOptionalNumberInput(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void,
): void {
  if (event.target.value === '') {
    onChange(undefined);
    return;
  }
  onChange(event.target.valueAsNumber);
}

async function submitRevenuePeriodUpdate(
  period: components['schemas']['RevenuePeriodResponse'],
  values: AdminUpdateRevenuePeriodFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminRevenuePeriod>['mutateAsync'],
  setError: UseFormSetError<AdminUpdateRevenuePeriodFormValues>,
): Promise<void> {
  const body = buildAdminRevenuePeriodUpdateBody({ period, values });
  if (body === null) {
    return;
  }
  try {
    await mutateAsync({ revenuePeriodId: period.id, body });
  } catch (error: unknown) {
    applyAdminFormApiError(error, setError, ['platformCutPercent', 'poolAmountCents']);
  }
}
