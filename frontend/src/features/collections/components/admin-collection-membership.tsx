import type { JSX } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminBookStatusBadge } from '@/features/books/components/admin-book-status-badge';
import { AdminAddCollectionBookDialog } from '@/features/collections/components/admin-add-collection-book-dialog';
import { useRemoveAdminCollectionBook } from '@/features/collections/hooks/use-remove-admin-collection-book';
import { useReorderAdminCollectionBooks } from '@/features/collections/hooks/use-reorder-admin-collection-books';
import { formatCollectionBookLabel } from '@/features/collections/lib/format-collection-book-label';
import { isSameBookOrder } from '@/features/collections/lib/is-same-book-order';
import { moveCollectionBook } from '@/features/collections/lib/move-collection-book';
import { sortCollectionItems } from '@/features/collections/lib/sort-collection-items';
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
  const removeMutation = useRemoveAdminCollectionBook();
  const reorderMutation = useReorderAdminCollectionBooks();
  const orderedItems = sortCollectionItems(collection.items);
  const currentBookIds: number[] = orderedItems.map((item) => item.bookId);
  const isBusy: boolean = removeMutation.isPending || reorderMutation.isPending;
  const membershipError: Error | null = removeMutation.error ?? reorderMutation.error;
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Membership</CardTitle>
          <CardDescription>
            Unpublished books can stay in admin membership. Readers do not see them in collection
            results. Reorder is skipped when the order did not change.
          </CardDescription>
        </div>
        <div className="shrink-0 self-start">
          <AdminAddCollectionBookDialog collection={collection} />
        </div>
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
                    <AdminBookStatusBadge value={findPublishingStatus(item.bookId, books) ?? 'unknown'} />
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
