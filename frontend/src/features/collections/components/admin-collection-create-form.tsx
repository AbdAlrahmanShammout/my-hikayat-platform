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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAdminCollection } from '@/features/collections/hooks/use-create-admin-collection';
import {
  adminCollectionEditorialFormSchema,
  type AdminCollectionEditorialFormValues,
} from '@/features/collections/schemas/admin-collection-editorial-form.schema';

/**
 * POST /admin/collections form. Books are added on the detail screen.
 */
export function AdminCollectionCreateForm(): JSX.Element {
  const navigate = useNavigate();
  const createMutation = useCreateAdminCollection();
  const form = useForm<AdminCollectionEditorialFormValues>({
    resolver: zodResolver(adminCollectionEditorialFormSchema),
    defaultValues: { title: '', description: '', accentColor: '' },
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
            className="flex flex-col gap-4"
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
              <Alert variant="destructive">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={createMutation.isPending} {...field} />
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
                    <Textarea disabled={createMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent color</FormLabel>
                  <FormControl>
                    <Input placeholder="#1A6B4A" disabled={createMutation.isPending} {...field} />
                  </FormControl>
                  <FormDescription>Optional six-digit hex for the reader hero.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMutation.isPending} className="self-start">
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitCreateCollection(
  values: AdminCollectionEditorialFormValues,
  mutateAsync: ReturnType<typeof useCreateAdminCollection>['mutateAsync'],
  setError: UseFormSetError<AdminCollectionEditorialFormValues>,
  onCreated: (collectionId: number) => void,
): Promise<void> {
  try {
    const created = await mutateAsync({
      title: values.title,
      description: values.description.trim().length === 0 ? null : values.description.trim(),
      accentColor: values.accentColor.trim().length === 0 ? null : values.accentColor.trim(),
    });
    onCreated(created.id);
  } catch (error: unknown) {
    applyEditorialServerError(error, setError);
  }
}

function applyEditorialServerError(
  error: unknown,
  setError: UseFormSetError<AdminCollectionEditorialFormValues>,
): void {
  if (error instanceof ApiError) {
    for (const item of error.validationErrorObjects) {
      if (
        item.property !== 'title' &&
        item.property !== 'description' &&
        item.property !== 'accentColor'
      ) {
        continue;
      }
      const firstConstraint: string | undefined = Object.values(item.constraints)[0];
      if (firstConstraint !== undefined) {
        setError(item.property, { message: firstConstraint });
      }
    }
  }
  setError('root', { message: getUserFacingErrorMessage(error) });
}
