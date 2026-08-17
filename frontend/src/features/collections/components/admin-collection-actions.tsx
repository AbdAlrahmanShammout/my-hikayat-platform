import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteAdminCollection } from '@/features/collections/hooks/use-delete-admin-collection';
import type { components } from '@/generated/admin';

type AdminCollectionActionsProps = {
  readonly collection: components['schemas']['CollectionResponse'];
};

/**
 * Soft-delete for an editorial collection.
 */
export function AdminCollectionActions({ collection }: AdminCollectionActionsProps): JSX.Element {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const deleteMutation = useDeleteAdminCollection();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>Soft-delete removes the collection from admin lists.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => {
            deleteMutation.reset();
            setIsConfirmOpen(true);
          }}
        >
          Delete
        </Button>
        <ConfirmDialog
          open={isConfirmOpen}
          title="Delete this collection?"
          description="This is a soft-delete. Membership is removed with the collection."
          confirmLabel="Delete"
          confirmVariant="destructive"
          isPending={deleteMutation.isPending}
          errorMessage={
            deleteMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(deleteMutation.error)
          }
          onOpenChange={setIsConfirmOpen}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(collection.id);
            setIsConfirmOpen(false);
            void navigate('/admin/collections');
          }}
        />
      </CardContent>
    </Card>
  );
}
