import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AuthorBookCategoryIdsField } from '@/features/books/components/author-book-category-ids-field';
import { useUpdateAuthorBook } from '@/features/books/hooks/use-update-author-book';
import { BOOK_TYPE_OPTIONS } from '@/features/books/lib/book-type-options';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { mergeCategoryOptions } from '@/features/books/lib/merge-category-options';
import {
  authorBookEditFormSchema,
  type AuthorBookEditFormValues,
} from '@/features/books/schemas/author-book-edit-form.schema';
import type { components } from '@/generated/author';

type AuthorBookEditFormProps = {
  readonly book: components['schemas']['BookResponse'];
  readonly categories: ReadonlyArray<components['schemas']['CategoryResponse']>;
  readonly isCategoriesPending: boolean;
  readonly categoriesError: Error | null;
  readonly onRetryCategories: () => void;
};

/**
 * PATCH /author/books/:id form. Only title, description, bookType, and categoryIds.
 */
export function AuthorBookEditForm({
  book,
  categories,
  isCategoriesPending,
  categoriesError,
  onRetryCategories,
}: AuthorBookEditFormProps): JSX.Element {
  const updateMutation = useUpdateAuthorBook();
  const categoryOptions = mergeCategoryOptions(categories, book.categories);
  const form = useForm<AuthorBookEditFormValues>({
    resolver: zodResolver(authorBookEditFormSchema),
    defaultValues: {
      title: book.title,
      description: book.description,
      bookType: book.bookType,
      categoryIds: book.categories.map((category) => category.id),
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>
          Publishing status is not changed by this form. The backend remains authoritative.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitBookEdit(book.id, values, updateMutation.mutateAsync, form.setError);
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            {form.formState.isSubmitSuccessful ? (
              <Alert>
                <AlertDescription>Metadata saved.</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={updateMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea disabled={updateMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book type</FormLabel>
                  <FormControl>
                    <Select disabled={updateMutation.isPending} {...field}>
                      {BOOK_TYPE_OPTIONS.map((bookType) => (
                        <option key={bookType} value={bookType}>
                          {formatBookEnumLabel(bookType)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Layout type and publishing status are not sent on this PATCH.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <AuthorBookCategoryIdsField
                    options={categoryOptions}
                    selectedIds={field.value}
                    isPending={isCategoriesPending}
                    error={categoriesError}
                    onRetry={onRetryCategories}
                    disabled={updateMutation.isPending}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save metadata'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitBookEdit(
  bookId: number,
  values: AuthorBookEditFormValues,
  mutateAsync: ReturnType<typeof useUpdateAuthorBook>['mutateAsync'],
  setError: UseFormSetError<AuthorBookEditFormValues>,
): Promise<void> {
  try {
    await mutateAsync({
      bookId,
      body: {
        title: values.title,
        description: values.description,
        bookType: values.bookType,
        categoryIds: values.categoryIds,
      },
    });
  } catch (error: unknown) {
    applyBookEditServerError(error, setError);
  }
}

function applyBookEditServerError(
  error: unknown,
  setError: UseFormSetError<AuthorBookEditFormValues>,
): void {
  applyValidationFieldErrors(error, setError);
  setError('root', { message: getUserFacingErrorMessage(error) });
}

function applyValidationFieldErrors(
  error: unknown,
  setError: UseFormSetError<AuthorBookEditFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (!isEditFormField(item.property)) {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}

function isEditFormField(property: string): property is keyof AuthorBookEditFormValues {
  return (
    property === 'title' ||
    property === 'description' ||
    property === 'bookType' ||
    property === 'categoryIds'
  );
}
