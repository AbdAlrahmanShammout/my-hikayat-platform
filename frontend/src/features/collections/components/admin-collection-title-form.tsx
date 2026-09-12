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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAdminCollection } from '@/features/collections/hooks/use-update-admin-collection';
import {
  adminCollectionEditorialFormSchema,
  type AdminCollectionEditorialFormValues,
} from '@/features/collections/schemas/admin-collection-editorial-form.schema';
import type { components } from '@/generated/admin';

type AdminCollectionTitleFormProps = {
  readonly collection: components['schemas']['CollectionResponse'];
};

/**
 * PATCH /admin/collections/:id title, description, and accent color form.
 */
export function AdminCollectionTitleForm({
  collection,
}: AdminCollectionTitleFormProps): JSX.Element {
  const updateMutation = useUpdateAdminCollection();
  const form = useForm<AdminCollectionEditorialFormValues>({
    resolver: zodResolver(adminCollectionEditorialFormSchema),
    defaultValues: {
      title: collection.title,
      description: collection.description ?? '',
      accentColor: collection.accentColor ?? '',
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editorial</CardTitle>
        <CardDescription>
          Title, description, and optional hex accent used by the reader collection hero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitEditorialEdit(
                collection.id,
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
            {form.formState.isSubmitSuccessful ? (
              <Alert>
                <AlertDescription>Collection saved.</AlertDescription>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea disabled={updateMutation.isPending} {...field} />
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
                    <Input
                      placeholder="#1A6B4A"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Six-digit hex, or blank to clear.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitEditorialEdit(
  collectionId: number,
  values: AdminCollectionEditorialFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminCollection>['mutateAsync'],
  setError: UseFormSetError<AdminCollectionEditorialFormValues>,
): Promise<void> {
  try {
    await mutateAsync({
      collectionId,
      body: {
        title: values.title,
        description: values.description.trim().length === 0 ? null : values.description.trim(),
        accentColor: values.accentColor.trim().length === 0 ? null : values.accentColor.trim(),
      },
    });
  } catch (error: unknown) {
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
}
