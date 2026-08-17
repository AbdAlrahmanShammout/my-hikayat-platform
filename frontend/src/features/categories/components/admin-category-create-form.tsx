import { zodResolver } from '@hookform/resolvers/zod';
import type { ChangeEvent, JSX } from 'react';
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
import { useCreateAdminCategory } from '@/features/categories/hooks/use-create-admin-category';
import { buildCreateAdminCategoryBody } from '@/features/categories/lib/build-create-admin-category-body';
import {
  adminCategoryCreateFormSchema,
  type AdminCategoryCreateFormValues,
} from '@/features/categories/schemas/admin-category-create-form.schema';

const EMPTY_CREATE_VALUES: AdminCategoryCreateFormValues = {
  name: '',
  slug: '',
  categoryWeight: undefined,
};

/**
 * POST /admin/categories form. Blank slug and weight are omitted so the API applies defaults.
 */
export function AdminCategoryCreateForm(): JSX.Element {
  const createMutation = useCreateAdminCategory();
  const [didCreate, setDidCreate] = useState<boolean>(false);
  const form = useForm<AdminCategoryCreateFormValues>({
    resolver: zodResolver(adminCategoryCreateFormSchema),
    defaultValues: EMPTY_CREATE_VALUES,
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>New category</CardTitle>
        <CardDescription>
          Name is required. Leave slug or weight blank to use the server defaults. Delete is not
          available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {didCreate ? (
          <Alert>
            <AlertDescription>Category created.</AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              setDidCreate(false);
              void submitCreateCategory(values, createMutation.mutateAsync, form.setError, () => {
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input disabled={createMutation.isPending} {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional. The API derives a slug from the name if omitted.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>categoryWeight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      className="w-28"
                      disabled={createMutation.isPending}
                      {...field}
                      value={
                        typeof field.value === 'number' && Number.isFinite(field.value)
                          ? field.value
                          : ''
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        applyOptionalCategoryWeightInput(event, field.onChange);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Optional. Greater than 0 when set.</FormDescription>
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

function applyOptionalCategoryWeightInput(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void,
): void {
  if (event.target.value === '') {
    onChange(undefined);
    return;
  }
  onChange(event.target.valueAsNumber);
}

async function submitCreateCategory(
  values: AdminCategoryCreateFormValues,
  mutateAsync: ReturnType<typeof useCreateAdminCategory>['mutateAsync'],
  setError: UseFormSetError<AdminCategoryCreateFormValues>,
  onSuccess: () => void,
): Promise<void> {
  try {
    await mutateAsync(buildCreateAdminCategoryBody(values));
    onSuccess();
  } catch (error: unknown) {
    applyCategoryFieldErrors(error, setError, ['name', 'slug', 'categoryWeight']);
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}

function applyCategoryFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminCategoryCreateFormValues>,
  properties: ReadonlyArray<'name' | 'slug' | 'categoryWeight'>,
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
  properties: ReadonlyArray<'name' | 'slug' | 'categoryWeight'>,
): property is 'name' | 'slug' | 'categoryWeight' {
  return properties.some((item) => item === property);
}
