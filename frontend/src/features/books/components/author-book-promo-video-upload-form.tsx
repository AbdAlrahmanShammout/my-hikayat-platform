import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AUTHOR_PROMO_VIDEO_UPLOAD } from '@/config/author-promo-video-upload';
import { useUploadAuthorBookPromoVideo } from '@/features/books/hooks/use-upload-author-book-promo-video';
import { formatBookAssetFileName } from '@/features/books/lib/format-book-asset-file-name';
import { getAuthorPromoVideoFileIssue } from '@/features/books/lib/get-author-promo-video-file-issue';
import type { components } from '@/generated/author';

type AuthorBookPromoVideoUploadFormProps = {
  readonly bookId: number;
};

/**
 * POST /author/books/:bookId/promo-video. Optional; a new upload replaces the stored video.
 */
export function AuthorBookPromoVideoUploadForm({
  bookId,
}: AuthorBookPromoVideoUploadFormProps): JSX.Element {
  const uploadMutation = useUploadAuthorBookPromoVideo();
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [clientIssue, setClientIssue] = useState<string | undefined>(undefined);
  const selectedIssue: string | undefined =
    selectedFile === undefined ? undefined : getAuthorPromoVideoFileIssue(selectedFile);
  const isSubmitDisabled: boolean =
    selectedFile === undefined || selectedIssue !== undefined || uploadMutation.isPending;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promo video</CardTitle>
        <CardDescription>
          Optional MP4 or WebM (up to {AUTHOR_PROMO_VIDEO_UPLOAD.maxBytes} bytes). The API stores
          catalog media unencrypted and replaces an existing promo video for this book.
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
            void submitPromoVideoUpload(
              bookId,
              selectedFile,
              uploadMutation.mutateAsync,
              setClientIssue,
            );
          }}
        >
          <div className="flex w-full max-w-md flex-col gap-2">
            <Label htmlFor="author-book-promo-video-file">MP4 or WebM</Label>
            <Input
              id="author-book-promo-video-file"
              type="file"
              accept=".mp4,.webm,video/mp4,video/webm"
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
              {uploadMutation.isPending ? 'Uploading…' : 'Upload promo video'}
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
        Promo video stored. {formatBookAssetFileName(asset.originalFileName)} · {asset.contentType}{' '}
        · {asset.byteSize} bytes · encrypted {asset.isEncrypted ? 'Yes' : 'No'}
      </AlertDescription>
    </Alert>
  );
}

async function submitPromoVideoUpload(
  bookId: number,
  selectedFile: File | undefined,
  mutateAsync: ReturnType<typeof useUploadAuthorBookPromoVideo>['mutateAsync'],
  setClientIssue: (message: string | undefined) => void,
): Promise<void> {
  if (selectedFile === undefined) {
    setClientIssue('Choose an MP4 or WebM file.');
    return;
  }
  const issue: string | undefined = getAuthorPromoVideoFileIssue(selectedFile);
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
