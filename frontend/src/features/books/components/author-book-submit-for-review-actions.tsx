import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useSubmitAuthorBookForReview } from '@/features/books/hooks/use-submit-author-book-for-review';
import {
  getAuthorBookSubmitAvailability,
  type AuthorBookSubmitAvailability,
} from '@/features/books/lib/get-author-book-submit-availability';
import type { components } from '@/generated/author';

type AuthorBookSubmitForReviewActionsProps = {
  readonly book: components['schemas']['BookResponse'];
};

/**
 * POST /author/books/:id/submit-for-review. Status transitions stay on the API.
 */
export function AuthorBookSubmitForReviewActions({
  book,
}: AuthorBookSubmitForReviewActionsProps): JSX.Element {
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const submitMutation = useSubmitAuthorBookForReview();
  const availability: AuthorBookSubmitAvailability = getAuthorBookSubmitAvailability(book);
  const trigger = (
    <Button
      type="button"
      disabled={!availability.canSubmit || submitMutation.isPending}
      onClick={() => {
        submitMutation.reset();
        setIsConfirmOpen(true);
      }}
    >
      Submit for review
    </Button>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review</CardTitle>
        <CardDescription>
          The API processes the source if needed, then sets publishingStatus to in_review. A 400
          from the API is still shown if processing is not ready or the transition is not allowed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {availability.submitDisabledReason === null || availability.canSubmit ? (
          trigger
        ) : (
          <Tooltip label={availability.submitDisabledReason}>{trigger}</Tooltip>
        )}
        <ConfirmDialog
          open={isConfirmOpen}
          title="Submit this book for review?"
          description="The API will process the source if needed and move publishingStatus to in_review. Publishing status is not patched from this screen."
          confirmLabel="Submit for review"
          isPending={submitMutation.isPending}
          errorMessage={
            submitMutation.error === null
              ? undefined
              : getUserFacingErrorMessage(submitMutation.error)
          }
          onOpenChange={(open: boolean) => {
            if (!open) {
              setIsConfirmOpen(false);
            }
          }}
          onConfirm={async () => {
            await submitMutation.mutateAsync(book.id);
            setIsConfirmOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
}
