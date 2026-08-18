import type { JSX } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormDescription } from '@/components/ui/form';

type CategoryOption = {
  readonly id: number;
  readonly name: string;
};

type AuthorBookCategoryIdsFieldProps = {
  readonly options: ReadonlyArray<CategoryOption>;
  readonly selectedIds: readonly number[];
  readonly isPending: boolean;
  readonly error: Error | null;
  readonly onRetry: () => void;
  readonly disabled: boolean;
  readonly onChange: (categoryIds: number[]) => void;
};

/**
 * Read-only taxonomy checkboxes from GET /author/categories. Authors cannot create categories.
 */
export function AuthorBookCategoryIdsField({
  options,
  selectedIds,
  isPending,
  error,
  onRetry,
  disabled,
  onChange,
}: AuthorBookCategoryIdsFieldProps): JSX.Element {
  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading categories…</p>;
  }
  if (error !== null) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-2">
          <span>{getUserFacingErrorMessage(error)}</span>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories yet. GET /author/categories returned an empty list.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((category) => (
          <label key={category.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-input"
              checked={selectedIds.includes(category.id)}
              disabled={disabled}
              onChange={(event) => {
                onChange(toggleCategoryId(selectedIds, category.id, event.target.checked));
              }}
            />
            {category.name}
          </label>
        ))}
      </div>
      <FormDescription>The taxonomy is admin-owned. This screen does not create categories.</FormDescription>
    </div>
  );
}

function toggleCategoryId(
  selectedIds: readonly number[],
  categoryId: number,
  isChecked: boolean,
): number[] {
  if (isChecked) {
    return selectedIds.includes(categoryId) ? [...selectedIds] : [...selectedIds, categoryId];
  }
  return selectedIds.filter((id) => id !== categoryId);
}
