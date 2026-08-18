import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { useCreateAuthorBook } from '@/features/books/hooks/use-create-author-book';
import { BOOK_TYPE_OPTIONS } from '@/features/books/lib/book-type-options';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import {
  authorBookCreateFormSchema,
  type AuthorBookCreateFormValues,
} from '@/features/books/schemas/author-book-create-form.schema';
import type { components } from '@/generated/author';

const EMPTY_CREATE_VALUES: AuthorBookCreateFormValues = {
  title: '',
  description: '',
  bookType: 'standard_chapter',
  categoryIds: [],
};

type AuthorBookCreateFormProps = {
  readonly isPublisher: boolean;
  readonly categories: ReadonlyArray<components['schemas']['CategoryResponse']>;
  readonly isCategoriesPending: boolean;
  readonly categoriesError: Error | null;
  readonly onRetryCategories: () => void;
};

/**
 * POST /author/books form. Publisher capability is displayed, not re-implemented.
 */
export function AuthorBookCreateForm({
  isPublisher,
  categories,
  isCategoriesPending,
  categoriesError,
  onRetryCategories,
}: AuthorBookCreateFormProps): JSX.Element {
  const navigate = useNavigate();
  const createMutation = useCreateAuthorBook();
  const form = useForm<AuthorBookCreateFormValues>({
    resolver: zodResolver(authorBookCreateFormSchema),
    defaultValues: EMPTY_CREATE_VALUES,
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  const isSubmitDisabled: boolean = !isPublisher || createMutation.isPending;
  return (
    <Card>
      <CardHeader>
        <CardTitle>New book</CardTitle>
        <CardDescription>
          Title, description, type, and optional categories are sent to POST /author/books.
          Publishing status starts as pending on the server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Publisher from GET /auth/me: {isPublisher ? 'Yes' : 'No'}. The API rejects create when
          this is No.
        </p>
        {!isPublisher ? (
          <Alert>
            <AlertDescription>
              Create is disabled because this account is not a publisher. The backend remains
              authoritative.
            </AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitCreateBook(values, createMutation.mutateAsync, form.setError, (bookId) => {
                void navigate(`/author/books/${bookId}`);
              });
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitDisabled} {...field} />
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
                    <Textarea disabled={isSubmitDisabled} {...field} />
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
                    <Select disabled={isSubmitDisabled} {...field}>
                      {BOOK_TYPE_OPTIONS.map((bookType) => (
                        <option key={bookType} value={bookType}>
                          {formatBookEnumLabel(bookType)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormDescription>Layout type is assigned during processing, not here.</FormDescription>
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
                    options={categories}
                    selectedIds={field.value}
                    isPending={isCategoriesPending}
                    error={categoriesError}
                    onRetry={onRetryCategories}
                    disabled={isSubmitDisabled}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" disabled={isSubmitDisabled}>
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitCreateBook(
  values: AuthorBookCreateFormValues,
  mutateAsync: ReturnType<typeof useCreateAuthorBook>['mutateAsync'],
  setError: UseFormSetError<AuthorBookCreateFormValues>,
  onCreated: (bookId: number) => void,
): Promise<void> {
  try {
    const created: { readonly id: number } = await mutateAsync({
      title: values.title,
      description: values.description,
      bookType: values.bookType,
      categoryIds: values.categoryIds,
    });
    onCreated(created.id);
  } catch (error: unknown) {
    applyCreateBookServerError(error, setError);
  }
}

function applyCreateBookServerError(
  error: unknown,
  setError: UseFormSetError<AuthorBookCreateFormValues>,
): void {
  applyValidationFieldErrors(error, setError);
  setError('root', { message: getUserFacingErrorMessage(error) });
}

function applyValidationFieldErrors(
  error: unknown,
  setError: UseFormSetError<AuthorBookCreateFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (!isCreateFormField(item.property)) {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}

function isCreateFormField(property: string): property is keyof AuthorBookCreateFormValues {
  return (
    property === 'title' ||
    property === 'description' ||
    property === 'bookType' ||
    property === 'categoryIds'
  );
}
