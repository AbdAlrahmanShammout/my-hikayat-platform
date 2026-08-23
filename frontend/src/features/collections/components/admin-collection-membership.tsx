import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { Link } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAddAdminCollectionBook } from '@/features/collections/hooks/use-add-admin-collection-book';
import { useRemoveAdminCollectionBook } from '@/features/collections/hooks/use-remove-admin-collection-book';
import { useReorderAdminCollectionBooks } from '@/features/collections/hooks/use-reorder-admin-collection-books';
import { formatCollectionBookLabel } from '@/features/collections/lib/format-collection-book-label';
import { isSameBookOrder } from '@/features/collections/lib/is-same-book-order';
import { moveCollectionBook } from '@/features/collections/lib/move-collection-book';
import { sortCollectionItems } from '@/features/collections/lib/sort-collection-items';
import {
  adminAddCollectionBookFormSchema,
  type AdminAddCollectionBookFormValues,
} from '@/features/collections/schemas/admin-add-collection-book-form.schema';
import type { components } from '@/generated/admin';

type AdminCollectionMembershipProps = {
  readonly collection: components['schemas']['CollectionResponse'];
  readonly books: ReadonlyArray<components['schemas']['BookResponse']>;
};

/**
 * Admin membership editor. Unpublished books stay visible here.
 */
export function AdminCollectionMembership({
  collection,
  books,
}: AdminCollectionMembershipProps): JSX.Element {
  const [removeBookId, setRemoveBookId] = useState<number | null>(null);
  const addMutation = useAddAdminCollectionBook();
  const removeMutation = useRemoveAdminCollectionBook();
  const reorderMutation = useReorderAdminCollectionBooks();
  const orderedItems = sortCollectionItems(collection.items);
  const currentBookIds: number[] = orderedItems.map((item) => item.bookId);
  const isBusy: boolean =
    addMutation.isPending || removeMutation.isPending || reorderMutation.isPending;
  const form = useForm<AdminAddCollectionBookFormValues>({
    resolver: zodResolver(adminAddCollectionBookFormSchema),
    defaultValues: { bookId: undefined as unknown as number },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  const membershipError: Error | null =
    addMutation.error ?? removeMutation.error ?? reorderMutation.error;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
        <CardDescription>
          Unpublished books can stay in admin membership. Readers do not see them in collection
          results. Reorder is skipped when the order did not change.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {membershipError !== null ? (
          <Alert variant="destructive">
            <AlertDescription>{getUserFacingErrorMessage(membershipError)}</AlertDescription>
          </Alert>
        ) : null}
        {orderedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">This collection has no books yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Publishing</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderedItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{String(item.displayOrder)}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      className="underline-offset-4 hover:underline"
                      to={`/admin/books/${item.bookId}`}
                    >
                      {formatCollectionBookLabel(item.bookId, books)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {findPublishingStatus(item.bookId, books) ?? 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy || index === 0}
                        onClick={() => {
                          void submitReorder({
                            collectionId: collection.id,
                            currentBookIds,
                            index,
                            direction: -1,
                            mutateAsync: reorderMutation.mutateAsync,
                          });
                        }}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy || index === orderedItems.length - 1}
                        onClick={() => {
                          void submitReorder({
                            collectionId: collection.id,
                            currentBookIds,
                            index,
                            direction: 1,
                            mutateAsync: reorderMutation.mutateAsync,
                          });
                        }}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => {
                          removeMutation.reset();
                          setRemoveBookId(item.bookId);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Form {...form}>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={form.handleSubmit((values) => {
              void submitAddBook(
                collection.id,
                values.bookId,
                currentBookIds,
                addMutation.mutateAsync,
                form.setError,
                () => {
                  form.reset({ bookId: undefined as unknown as number });
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
              name="bookId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Add book id</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      disabled={isBusy}
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
            <Button type="submit" disabled={isBusy}>
              {addMutation.isPending ? 'Adding…' : 'Add book'}
            </Button>
          </form>
        </Form>
        <ConfirmDialog
          open={removeBookId !== null}
          title="Remove this book?"
          description="The book stays in the catalog. It is only removed from this collection."
          confirmLabel="Remove"
          confirmVariant="destructive"
          isPending={removeMutation.isPending}
          errorMessage={
            removeMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(removeMutation.error)
          }
          onOpenChange={(open: boolean) => {
            if (!open) {
              setRemoveBookId(null);
            }
          }}
          onConfirm={async () => {
            if (removeBookId === null) {
              return;
            }
            await removeMutation.mutateAsync({
              collectionId: collection.id,
              bookId: removeBookId,
            });
            setRemoveBookId(null);
          }}
        />
      </CardContent>
    </Card>
  );
}

function findPublishingStatus(
  bookId: number,
  books: ReadonlyArray<components['schemas']['BookResponse']>,
): string | undefined {
  return books.find((book) => book.id === bookId)?.publishingStatus;
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

async function submitReorder(input: {
  readonly collectionId: number;
  readonly currentBookIds: readonly number[];
  readonly index: number;
  readonly direction: -1 | 1;
  readonly mutateAsync: ReturnType<typeof useReorderAdminCollectionBooks>['mutateAsync'];
}): Promise<void> {
  const nextBookIds: number[] = moveCollectionBook({
    bookIds: input.currentBookIds,
    index: input.index,
    direction: input.direction,
  });
  if (isSameBookOrder(input.currentBookIds, nextBookIds)) {
    return;
  }
  try {
    await input.mutateAsync({ collectionId: input.collectionId, bookIds: nextBookIds });
  } catch {
    return;
  }
}
