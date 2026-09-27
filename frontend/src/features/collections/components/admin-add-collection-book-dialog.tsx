import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAddAdminCollectionBook } from '@/features/collections/hooks/use-add-admin-collection-book';
import {
  adminAddCollectionBookFormSchema,
  type AdminAddCollectionBookFormValues,
} from '@/features/collections/schemas/admin-add-collection-book-form.schema';
import type { components } from '@/generated/admin';

type AdminAddCollectionBookDialogProps = {
  readonly collection: components['schemas']['CollectionResponse'];
};

/**
 * POST membership dialog. Adds a catalog book by id to this collection.
 */
export function AdminAddCollectionBookDialog({
  collection,
}: AdminAddCollectionBookDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const currentBookIds: readonly number[] = collection.items.map((item) => item.bookId);
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Add book
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add book</DialogTitle>
            <DialogDescription>
              Unpublished books can stay in admin membership. Readers do not see them in collection
              results.
            </DialogDescription>
          </DialogHeader>
          {isOpen ? (
            <AdminAddCollectionBookForm
              collectionId={collection.id}
              currentBookIds={currentBookIds}
              onCancel={() => setIsOpen(false)}
              onSuccess={() => setIsOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminAddCollectionBookFormProps = {
  readonly collectionId: number;
  readonly currentBookIds: readonly number[];
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
};

function AdminAddCollectionBookForm({
  collectionId,
  currentBookIds,
  onCancel,
  onSuccess,
}: AdminAddCollectionBookFormProps): JSX.Element {
  const addMutation = useAddAdminCollectionBook();
  const form = useForm<AdminAddCollectionBookFormValues>({
    resolver: zodResolver(adminAddCollectionBookFormSchema),
    defaultValues: { bookId: undefined as unknown as number },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          void submitAddBook(
            collectionId,
            values.bookId,
            currentBookIds,
            addMutation.mutateAsync,
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
          name="bookId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book id</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  disabled={addMutation.isPending}
                  value={
                    field.value === undefined || Number.isNaN(field.value)
                      ? ''
                      : String(field.value)
                  }
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={addMutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={addMutation.isPending}>
            {addMutation.isPending ? 'Adding…' : 'Add book'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

async function submitAddBook(
  collectionId: number,
  bookId: number,
  currentBookIds: readonly number[],
  mutateAsync: ReturnType<typeof useAddAdminCollectionBook>['mutateAsync'],
  setError: UseFormSetError<AdminAddCollectionBookFormValues>,
  onAdded: () => void,
): Promise<void> {
  if (currentBookIds.includes(bookId)) {
    setError('bookId', { message: `Book ${bookId} is already in this collection.` });
    return;
  }
  try {
    await mutateAsync({ collectionId, bookId });
    onAdded();
  } catch (error: unknown) {
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}
