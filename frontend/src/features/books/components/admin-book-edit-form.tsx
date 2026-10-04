import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Info, Pencil, X } from 'lucide-react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAdminBook } from '@/features/books/hooks/use-update-admin-book';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { mergeCategoryOptions } from '@/features/books/lib/merge-category-options';
import {
  adminBookEditFormSchema,
  type AdminBookEditFormValues,
} from '@/features/books/schemas/admin-book-edit-form.schema';
import type { components } from '@/generated/admin';
import { cn } from '@/lib/cn';

const BOOK_TYPE_OPTIONS = ['standard_chapter', 'picture_book', 'illustrated_chapter'] as const;

type AdminBookEditFormProps = {
  readonly book: components['schemas']['BookResponse'];
  readonly categories: ReadonlyArray<components['schemas']['CategoryResponse']>;
  readonly isCategoriesPending: boolean;
};

/**
 * PATCH /admin/books/:id form. Only title, description, bookType, and categoryIds.
 */
export function AdminBookEditForm({
  book,
  categories,
  isCategoriesPending,
}: AdminBookEditFormProps): JSX.Element {
  const updateMutation = useUpdateAdminBook();
  const categoryOptions = mergeCategoryOptions(categories, book.categories);
  const form = useForm<AdminBookEditFormValues>({
    resolver: zodResolver(adminBookEditFormSchema),
    defaultValues: {
      title: book.title,
      description: book.description,
      bookType: book.bookType,
      categoryIds: book.categories.map((category) => category.id),
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card className="overflow-hidden rounded-[10px] border-border/70 shadow-xs">
      <CardHeader className="p-5 pb-4">
        <div className="flex items-start gap-2">
          <div className="flex size-7 items-center justify-center rounded-sm bg-secondary">
            <Pencil className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="font-sans text-sm font-bold">Edit Metadata</CardTitle>
            <CardDescription className="text-xs">Does not change publishing status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <Alert className="mb-4 border-primary/30 bg-accent text-accent-foreground">
          <Info className="absolute left-3 top-3 size-4" aria-hidden="true" />
          <AlertDescription className="pl-5 text-xs leading-5">
            Admin cannot upload source files, change layout type, or set processing status. Those
            belong to the author book flow.
          </AlertDescription>
        </Alert>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[112px]"
                        placeholder="Book description..."
                        disabled={updateMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <div className="flex min-h-10 flex-wrap gap-1.5 rounded-sm border border-input bg-background px-2.5 py-2">
                    {isCategoriesPending ? (
                      <p className="text-sm text-muted-foreground">Loading categories…</p>
                    ) : (
                      categoryOptions.map((category) => (
                        <label key={category.id} className="inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={field.value.includes(category.id)}
                            disabled={updateMutation.isPending}
                            onChange={(event) => {
                              field.onChange(
                                toggleCategoryId(field.value, category.id, event.target.checked),
                              );
                            }}
                          />
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                              field.value.includes(category.id)
                                ? 'bg-accent text-primary'
                                : 'bg-secondary text-muted-foreground',
                            )}
                          >
                            {category.name}
                            {field.value.includes(category.id) ? (
                              <X className="size-2.5" aria-hidden="true" />
                            ) : null}
                          </span>
                        </label>
                      ))
                    )}
                    {!isCategoriesPending ? (
                      <span className="self-center text-xs text-muted-foreground">+ Add category</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select from the platform category list. Category weight affects revenue
                    calculation.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                <Check className="size-3.5" aria-hidden="true" />
                {updateMutation.isPending ? 'Saving...' : 'Save metadata'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => {
                  form.reset();
                }}
              >
                Discard
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitBookEdit(
  bookId: number,
  values: AdminBookEditFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminBook>['mutateAsync'],
  setError: UseFormSetError<AdminBookEditFormValues>,
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
  setError: UseFormSetError<AdminBookEditFormValues>,
): void {
  applyValidationFieldErrors(error, setError);
  setError('root', { message: getUserFacingErrorMessage(error) });
}

function applyValidationFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminBookEditFormValues>,
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

function isEditFormField(property: string): property is keyof AdminBookEditFormValues {
  return (
    property === 'title' ||
    property === 'description' ||
    property === 'bookType' ||
    property === 'categoryIds'
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
