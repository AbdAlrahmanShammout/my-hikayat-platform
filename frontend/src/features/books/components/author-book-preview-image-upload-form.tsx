import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AUTHOR_PREVIEW_IMAGE_UPLOAD } from '@/config/author-preview-image-upload';
import { useUploadAuthorBookPreviewImage } from '@/features/books/hooks/use-upload-author-book-preview-image';
import { formatBookAssetFileName } from '@/features/books/lib/format-book-asset-file-name';
import { getAuthorPreviewFileIssue } from '@/features/books/lib/get-author-preview-file-issue';
import type { components } from '@/generated/author';

type AuthorBookPreviewImageUploadFormProps = {
  readonly bookId: number;
};

/**
 * POST /author/books/:bookId/preview-image. Catalog media is stored unencrypted.
 */
export function AuthorBookPreviewImageUploadForm({
  bookId,
}: AuthorBookPreviewImageUploadFormProps): JSX.Element {
  const uploadMutation = useUploadAuthorBookPreviewImage();
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [clientIssue, setClientIssue] = useState<string | undefined>(undefined);
  const selectedIssue: string | undefined =
    selectedFile === undefined ? undefined : getAuthorPreviewFileIssue(selectedFile);
  const isSubmitDisabled: boolean =
    selectedFile === undefined || selectedIssue !== undefined || uploadMutation.isPending;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview image</CardTitle>
        <CardDescription>
          Upload a JPEG, PNG, or WebP (up to {AUTHOR_PREVIEW_IMAGE_UPLOAD.maxBytes} bytes). The API
          stores catalog media unencrypted. This screen does not list previously stored previews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        {uploadMutation.data !== undefined ? (
          <UploadedMediaSummary asset={uploadMutation.data} />
        ) : null}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitPreviewUpload(
              bookId,
              selectedFile,
              uploadMutation.mutateAsync,
              setClientIssue,
            );
          }}
        >
          <div className="flex w-full max-w-md flex-col gap-2">
            <Label htmlFor="author-book-preview-image-file">JPEG, PNG, or WebP</Label>
            <Input
              id="author-book-preview-image-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="h-auto"
              disabled={uploadMutation.isPending}
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
          <div>
            <Button type="submit" disabled={isSubmitDisabled}>
              {uploadMutation.isPending ? 'Uploading…' : 'Upload preview'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function UploadedMediaSummary({
  asset,
}: {
  readonly asset: components['schemas']['BookAssetResponse'];
}): JSX.Element {
  return (
    <Alert>
      <AlertDescription>
        Preview stored. {formatBookAssetFileName(asset.originalFileName)} · {asset.contentType} ·{' '}
        {asset.byteSize} bytes · encrypted {asset.isEncrypted ? 'Yes' : 'No'}
      </AlertDescription>
    </Alert>
  );
}

async function submitPreviewUpload(
  bookId: number,
  selectedFile: File | undefined,
  mutateAsync: ReturnType<typeof useUploadAuthorBookPreviewImage>['mutateAsync'],
  setClientIssue: (message: string | undefined) => void,
): Promise<void> {
  if (selectedFile === undefined) {
    setClientIssue('Choose a JPEG, PNG, or WebP file.');
    return;
  }
  const issue: string | undefined = getAuthorPreviewFileIssue(selectedFile);
  if (issue !== undefined) {
    setClientIssue(issue);
    return;
  }
  setClientIssue(undefined);
  try {
    await mutateAsync({ bookId, file: selectedFile });
  } catch {
    return;
  }
}
