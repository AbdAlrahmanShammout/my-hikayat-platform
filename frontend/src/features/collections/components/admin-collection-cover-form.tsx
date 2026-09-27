import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClearAdminCollectionCover } from '@/features/collections/hooks/use-clear-admin-collection-cover';
import { useUploadAdminCollectionCover } from '@/features/collections/hooks/use-upload-admin-collection-cover';
import { getAdminCollectionCoverFileIssue } from '@/features/collections/lib/get-admin-collection-cover-file-issue';
import type { components } from '@/generated/admin';

type AdminCollectionCoverFormProps = {
  readonly collection: components['schemas']['CollectionResponse'];
};

/**
 * Uploads or removes the collection cover image.
 */
export function AdminCollectionCoverForm({
  collection,
}: AdminCollectionCoverFormProps): JSX.Element {
  const uploadMutation = useUploadAdminCollectionCover();
  const clearMutation = useClearAdminCollectionCover();
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [clientIssue, setClientIssue] = useState<string | undefined>(undefined);
  const selectedIssue: string | undefined =
    selectedFile === undefined ? undefined : getAdminCollectionCoverFileIssue(selectedFile);
  const isBusy: boolean = uploadMutation.isPending || clearMutation.isPending;
  const isSubmitDisabled: boolean = selectedFile === undefined || selectedIssue !== undefined || isBusy;
  const coverUrl: string | undefined = collection.cover?.url;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover</CardTitle>
        <CardDescription>JPEG, PNG, or WebP. Readers see this image instead of a color.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {coverUrl !== undefined ? (
          <img
            src={coverUrl}
            alt={`${collection.title} cover`}
            className="h-40 w-28 rounded-md object-cover"
          />
        ) : (
          <p className="text-sm text-muted-foreground">No cover yet.</p>
        )}
        {clientIssue !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>{clientIssue}</AlertDescription>
          </Alert>
        ) : null}
        {uploadMutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{getUserFacingErrorMessage(uploadMutation.error)}</AlertDescription>
          </Alert>
        ) : null}
        {clearMutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{getUserFacingErrorMessage(clearMutation.error)}</AlertDescription>
          </Alert>
        ) : null}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitCoverUpload(collection.id, selectedFile, uploadMutation.mutateAsync, setClientIssue, () => {
              setSelectedFile(undefined);
            });
          }}
        >
          <div className="flex w-full max-w-md flex-col gap-2">
            <Label htmlFor="admin-collection-cover-file">JPEG, PNG, or WebP</Label>
            <Input
              id="admin-collection-cover-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="h-auto"
              disabled={isBusy}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const nextFile: File | undefined = event.target.files?.item(0) ?? undefined;
                setSelectedFile(nextFile);
                setClientIssue(undefined);
                uploadMutation.reset();
              }}
            />
            {selectedIssue !== undefined ? (
              <p className="text-sm text-destructive">{selectedIssue}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitDisabled}>
              {uploadMutation.isPending ? 'Uploading…' : 'Upload cover'}
            </Button>
            {coverUrl !== undefined ? (
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => {
                  clearMutation.mutate(collection.id);
                }}
              >
                {clearMutation.isPending ? 'Removing…' : 'Remove cover'}
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

async function submitCoverUpload(
  collectionId: number,
  selectedFile: File | undefined,
  mutateAsync: ReturnType<typeof useUploadAdminCollectionCover>['mutateAsync'],
  setClientIssue: (message: string | undefined) => void,
  onUploaded: () => void,
): Promise<void> {
  if (selectedFile === undefined) {
    setClientIssue('Choose a JPEG, PNG, or WebP file.');
    return;
  }
  const issue: string | undefined = getAdminCollectionCoverFileIssue(selectedFile);
  if (issue !== undefined) {
    setClientIssue(issue);
    return;
  }
  setClientIssue(undefined);
  try {
    await mutateAsync({ collectionId, file: selectedFile });
    onUploaded();
  } catch {
    return;
  }
}
