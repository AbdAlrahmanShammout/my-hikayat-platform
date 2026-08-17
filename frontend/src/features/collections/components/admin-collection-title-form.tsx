import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateAdminCollection } from '@/features/collections/hooks/use-update-admin-collection';
import {
  adminCollectionTitleFormSchema,
  type AdminCollectionTitleFormValues,
} from '@/features/collections/schemas/admin-collection-title-form.schema';
import type { components } from '@/generated/admin';

type AdminCollectionTitleFormProps = {
  readonly collection: components['schemas']['CollectionResponse'];
};

/**
 * PATCH /admin/collections/:id title form.
 */
export function AdminCollectionTitleForm({
  collection,
}: AdminCollectionTitleFormProps): JSX.Element {
  const updateMutation = useUpdateAdminCollection();
  const form = useForm<AdminCollectionTitleFormValues>({
    resolver: zodResolver(adminCollectionTitleFormSchema),
    defaultValues: { title: collection.title },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>PATCH accepts title only.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitTitleEdit(collection.id, values, updateMutation.mutateAsync, form.setError);
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            {form.formState.isSubmitSuccessful ? (
              <Alert>
                <AlertDescription>Title saved.</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={updateMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save title'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitTitleEdit(
  collectionId: number,
  values: AdminCollectionTitleFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminCollection>['mutateAsync'],
  setError: UseFormSetError<AdminCollectionTitleFormValues>,
): Promise<void> {
  try {
    await mutateAsync({ collectionId, body: { title: values.title } });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      for (const item of error.validationErrorObjects) {
        if (item.property !== 'title') {
          continue;
        }
        const firstConstraint: string | undefined = Object.values(item.constraints)[0];
        if (firstConstraint !== undefined) {
          setError('title', { message: firstConstraint });
        }
      }
    }
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}
