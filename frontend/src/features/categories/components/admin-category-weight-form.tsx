import { zodResolver } from '@hookform/resolvers/zod';
import type { ChangeEvent, JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateAdminCategory } from '@/features/categories/hooks/use-update-admin-category';
import { isSameCategoryWeight } from '@/features/categories/lib/is-same-category-weight';
import {
  adminCategoryWeightFormSchema,
  type AdminCategoryWeightFormValues,
} from '@/features/categories/schemas/admin-category-weight-form.schema';
import type { components } from '@/generated/admin';

type AdminCategoryWeightFormProps = {
  readonly category: components['schemas']['CategoryResponse'];
};

/**
 * PATCH /admin/categories/:id form. Only categoryWeight greater than 0.
 */
export function AdminCategoryWeightForm({ category }: AdminCategoryWeightFormProps): JSX.Element {
  const updateMutation = useUpdateAdminCategory();
  const form = useForm<AdminCategoryWeightFormValues>({
    resolver: zodResolver(adminCategoryWeightFormSchema),
    defaultValues: { categoryWeight: category.categoryWeight },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  const watchedWeight: number | undefined = form.watch('categoryWeight');
  const isUnchanged: boolean =
    typeof watchedWeight === 'number' &&
    isSameCategoryWeight(category.categoryWeight, watchedWeight);
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit((values) => {
          void submitCategoryWeight(category, values, updateMutation.mutateAsync, form.setError);
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
            <AlertDescription>Weight saved.</AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="categoryWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">categoryWeight for {category.name}</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className="w-28"
                    disabled={updateMutation.isPending}
                    {...field}
                    value={Number.isFinite(field.value) ? field.value : ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      applyCategoryWeightInput(event, field.onChange);
                    }}
                  />
                </FormControl>
                <Button type="submit" size="sm" disabled={updateMutation.isPending || isUnchanged}>
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

function applyCategoryWeightInput(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void,
): void {
  if (event.target.value === '') {
    onChange(undefined);
    return;
  }
  onChange(event.target.valueAsNumber);
}

async function submitCategoryWeight(
  category: components['schemas']['CategoryResponse'],
  values: AdminCategoryWeightFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminCategory>['mutateAsync'],
  setError: UseFormSetError<AdminCategoryWeightFormValues>,
): Promise<void> {
  if (isSameCategoryWeight(category.categoryWeight, values.categoryWeight)) {
    return;
  }
  try {
    await mutateAsync({
      categoryId: category.id,
      body: { categoryWeight: values.categoryWeight },
    });
  } catch (error: unknown) {
    applyCategoryWeightFieldErrors(error, setError);
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}

function applyCategoryWeightFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminCategoryWeightFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (item.property !== 'categoryWeight') {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError('categoryWeight', { message: firstConstraint });
    }
  }
}
