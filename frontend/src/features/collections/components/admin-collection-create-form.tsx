import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { useCreateAdminCollection } from '@/features/collections/hooks/use-create-admin-collection';
import {
  adminCollectionTitleFormSchema,
  type AdminCollectionTitleFormValues,
} from '@/features/collections/schemas/admin-collection-title-form.schema';

/**
 * POST /admin/collections form. Books are added on the detail screen.
 */
export function AdminCollectionCreateForm(): JSX.Element {
  const navigate = useNavigate();
  const createMutation = useCreateAdminCollection();
  const form = useForm<AdminCollectionTitleFormValues>({
    resolver: zodResolver(adminCollectionTitleFormSchema),
    defaultValues: { title: '' },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>New collection</CardTitle>
        <CardDescription>Create with a title, then add books on the next screen.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={form.handleSubmit((values) => {
              void submitCreateCollection(
                values,
                createMutation.mutateAsync,
                form.setError,
                (collectionId) => {
                  void navigate(`/admin/collections/${collectionId}`);
                },
              );
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive" className="sm:min-w-full">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={createMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitCreateCollection(
  values: AdminCollectionTitleFormValues,
  mutateAsync: ReturnType<typeof useCreateAdminCollection>['mutateAsync'],
  setError: UseFormSetError<AdminCollectionTitleFormValues>,
  onCreated: (collectionId: number) => void,
): Promise<void> {
  try {
    const created = await mutateAsync({ title: values.title });
    onCreated(created.id);
  } catch (error: unknown) {
    applyTitleServerError(error, setError);
  }
}

function applyTitleServerError(
  error: unknown,
  setError: UseFormSetError<AdminCollectionTitleFormValues>,
): void {
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
