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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateAdminCategory } from '@/features/categories/hooks/use-update-admin-category';
import { buildAdminCategoryRenameBody } from '@/features/categories/lib/build-admin-category-rename-body';
import {
  adminCategoryRenameFormSchema,
  type AdminCategoryRenameFormValues,
} from '@/features/categories/schemas/admin-category-rename-form.schema';
import type { components } from '@/generated/admin';

type AdminCategoryRenameDialogProps = {
  readonly category: components['schemas']['CategoryResponse'];
};

/**
 * PATCH /admin/categories/:id dialog for name and slug. Weight is not sent.
 */
export function AdminCategoryRenameDialog({
  category,
}: AdminCategoryRenameDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Rename
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
            <DialogDescription>
              Updates name and/or slug. Omitted weight is left unchanged. The API does not delete
              categories.
            </DialogDescription>
          </DialogHeader>
          {isOpen ? (
            <AdminCategoryRenameForm
              category={category}
              onCancel={() => setIsOpen(false)}
              onSuccess={() => setIsOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminCategoryRenameFormProps = {
  readonly category: components['schemas']['CategoryResponse'];
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
};

function AdminCategoryRenameForm({
  category,
  onCancel,
  onSuccess,
}: AdminCategoryRenameFormProps): JSX.Element {
  const updateMutation = useUpdateAdminCategory();
  const form = useForm<AdminCategoryRenameFormValues>({
    resolver: zodResolver(adminCategoryRenameFormSchema),
    defaultValues: { name: category.name, slug: category.slug },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  const watchedName: string = form.watch('name');
  const watchedSlug: string = form.watch('slug');
  const isUnchanged: boolean = watchedName === category.name && watchedSlug === category.slug;
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          void submitRenameCategory(
            category,
            values,
            updateMutation.mutateAsync,
            form.setError,
            onSuccess,
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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input disabled={updateMutation.isPending} {...field} />
              </FormControl>
              <FormDescription>Renaming does not change categoryWeight.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending || isUnchanged}>
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

async function submitRenameCategory(
  category: components['schemas']['CategoryResponse'],
  values: AdminCategoryRenameFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminCategory>['mutateAsync'],
  setError: UseFormSetError<AdminCategoryRenameFormValues>,
  onSuccess: () => void,
): Promise<void> {
  const body: components['schemas']['UpdateCategoryRequestDto'] | null =
    buildAdminCategoryRenameBody({ category, values });
  if (body === null) {
    return;
  }
  try {
    await mutateAsync({ categoryId: category.id, body });
    onSuccess();
  } catch (error: unknown) {
    applyRenameFieldErrors(error, setError);
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}

function applyRenameFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminCategoryRenameFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (item.property !== 'name' && item.property !== 'slug') {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}
