import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AUTHOR_SOURCE_FILE_UPLOAD } from '@/config/author-source-file-upload';
import { useUploadAuthorBookSource } from '@/features/books/hooks/use-upload-author-book-source';
import { getAuthorSourceFileIssue } from '@/features/books/lib/get-author-source-file-issue';
import type { components } from '@/generated/author';

type AuthorBookSourceUploadFormProps = {
  readonly bookId: number;
};

/**
 * POST /author/books/:bookId/source. Encryption stays on the backend.
 */
export function AuthorBookSourceUploadForm({
  bookId,
}: AuthorBookSourceUploadFormProps): JSX.Element {
  const uploadMutation = useUploadAuthorBookSource();
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [clientIssue, setClientIssue] = useState<string | undefined>(undefined);
  const selectedIssue: string | undefined =
    selectedFile === undefined ? undefined : getAuthorSourceFileIssue(selectedFile);
  const isSubmitDisabled: boolean =
    selectedFile === undefined || selectedIssue !== undefined || uploadMutation.isPending;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source file</CardTitle>
        <CardDescription>
          Upload an EPUB or PDF (up to {AUTHOR_SOURCE_FILE_UPLOAD.maxBytes} bytes). The API encrypts
          and stores the bytes. This screen does not list previously stored sources.
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
          <UploadedSourceSummary asset={uploadMutation.data} />
        ) : null}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitSourceUpload(bookId, selectedFile, uploadMutation.mutateAsync, setClientIssue);
          }}
        >
          <div className="flex w-full max-w-md flex-col gap-2">
            <Label htmlFor="author-book-source-file">EPUB or PDF</Label>
            <Input
              id="author-book-source-file"
              type="file"
              accept=".epub,.pdf,application/epub+zip,application/epub,application/pdf"
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
              {uploadMutation.isPending ? 'Uploading…' : 'Upload source'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function UploadedSourceSummary({
  asset,
}: {
  readonly asset: components['schemas']['BookAssetResponse'];
}): JSX.Element {
  return (
    <Alert>
      <AlertDescription>
        Source stored encrypted. {formatAssetFileName(asset.originalFileName)} · {asset.contentType}{' '}
        · {asset.byteSize} bytes · encrypted {asset.isEncrypted ? 'Yes' : 'No'}
      </AlertDescription>
    </Alert>
  );
}

async function submitSourceUpload(
  bookId: number,
  selectedFile: File | undefined,
  mutateAsync: ReturnType<typeof useUploadAuthorBookSource>['mutateAsync'],
  setClientIssue: (message: string | undefined) => void,
): Promise<void> {
  if (selectedFile === undefined) {
    setClientIssue('Choose an EPUB or PDF file.');
    return;
  }
  const issue: string | undefined = getAuthorSourceFileIssue(selectedFile);
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

function formatAssetFileName(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'Unnamed file';
  }
  return value;
}
