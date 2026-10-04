import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { BOOK_PUBLISHING_STATUS_FILTERS } from '@/features/books/lib/book-publishing-status-filters';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import {
  ADMIN_BOOK_SORT_FIELDS,
  ADMIN_SORT_ORDERS,
  BOOK_LAYOUT_FILTERS,
  BOOK_PROCESSING_STATUS_FILTERS,
  BOOK_TYPE_FILTERS,
  type AdminBooksListSearch,
} from '@/features/books/lib/parse-admin-books-list-search';

type AdminBooksFiltersProps = {
  readonly value: AdminBooksListSearch;
  readonly lockOwner: boolean;
  readonly onApply: (nextSearch: AdminBooksListSearch) => void;
  readonly onClear: () => void;
};

type CatalogDraft = {
  readonly q: string;
  readonly categoryIds: string;
  readonly authorName: string;
  readonly publisherName: string;
  readonly ownerIds: string;
  readonly bookTypes: readonly string[];
  readonly layoutTypes: readonly string[];
  readonly publishingStatuses: readonly string[];
  readonly processingStatuses: readonly string[];
  readonly catalogVisible: string;
  readonly sortBy: string;
  readonly sortOrder: string;
};

/**
 * Apply/Clear catalog filters for GET /admin/books. Typing does not send a request.
 */
export function AdminBooksFilters({
  value,
  lockOwner,
  onApply,
  onClear,
}: AdminBooksFiltersProps): JSX.Element {
  const [draft, setDraft] = useState<CatalogDraft>(() => toDraft(value));
  const [keywordError, setKeywordError] = useState<string | undefined>(undefined);
  const [idError, setIdError] = useState<string | undefined>(undefined);
  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = parseDraft(draft);
        setKeywordError(parsed.keywordError);
        setIdError(parsed.idError);
        if (parsed.search === undefined) {
          return;
        }
        onApply({ ...parsed.search, offset: 0 });
      }}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">Catalog filters</h2>
        <p className="text-sm text-muted-foreground">
          Keyword search matches title, description, EPUB creator, and EPUB publisher. It does not
          search chapter or page text. Choose Apply to send the filters.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Keyword" htmlFor="catalog-q">
          <Input
            id="catalog-q"
            value={draft.q}
            aria-invalid={keywordError !== undefined}
            placeholder="At least 2 characters"
            onChange={(event) => {
              setDraft({ ...draft, q: event.target.value });
              setKeywordError(undefined);
            }}
          />
        </Field>
        <Field label="Category ids" htmlFor="catalog-categories">
          <Input
            id="catalog-categories"
            value={draft.categoryIds}
            placeholder="4, 9"
            aria-invalid={idError !== undefined}
            onChange={(event) => {
              setDraft({ ...draft, categoryIds: event.target.value });
              setIdError(undefined);
            }}
          />
        </Field>
        <Field label="EPUB creator" htmlFor="catalog-creator">
          <Input
            id="catalog-creator"
            value={draft.authorName}
            onChange={(event) => setDraft({ ...draft, authorName: event.target.value })}
          />
        </Field>
        <Field label="EPUB publisher" htmlFor="catalog-epub-publisher">
          <Input
            id="catalog-epub-publisher"
            value={draft.publisherName}
            onChange={(event) => setDraft({ ...draft, publisherName: event.target.value })}
          />
        </Field>
        {lockOwner ? null : (
          <Field label="Publisher account ids" htmlFor="catalog-owners">
            <Input
              id="catalog-owners"
              value={draft.ownerIds}
              placeholder="12, 18"
              onChange={(event) => setDraft({ ...draft, ownerIds: event.target.value })}
            />
          </Field>
        )}
        <Field label="Catalog visibility" htmlFor="catalog-visible">
          <Select
            id="catalog-visible"
            value={draft.catalogVisible}
            onChange={(event) => setDraft({ ...draft, catalogVisible: event.target.value })}
          >
            <option value="">Any</option>
            <option value="true">Catalog visible</option>
            <option value="false">Not catalog visible</option>
          </Select>
        </Field>
        <Field label="Sort by" htmlFor="catalog-sort-by">
          <Select
            id="catalog-sort-by"
            value={draft.sortBy}
            onChange={(event) => setDraft({ ...draft, sortBy: event.target.value })}
          >
            <option value="">Default</option>
            {ADMIN_BOOK_SORT_FIELDS.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sort order" htmlFor="catalog-sort-order">
          <Select
            id="catalog-sort-order"
            value={draft.sortOrder}
            onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })}
          >
            <option value="">Default</option>
            {ADMIN_SORT_ORDERS.map((order) => (
              <option key={order} value={order}>
                {order}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <MultiFilter
        id="catalog-book-type"
        label="Book type"
        options={BOOK_TYPE_FILTERS}
        selected={draft.bookTypes}
        onChange={(bookTypes) => setDraft({ ...draft, bookTypes })}
      />
      <MultiFilter
        id="catalog-layout"
        label="Layout type"
        options={BOOK_LAYOUT_FILTERS}
        selected={draft.layoutTypes}
        onChange={(layoutTypes) => setDraft({ ...draft, layoutTypes })}
      />
      <MultiFilter
        id="catalog-publishing"
        label="Publishing status"
        options={BOOK_PUBLISHING_STATUS_FILTERS}
        selected={draft.publishingStatuses}
        onChange={(publishingStatuses) => setDraft({ ...draft, publishingStatuses })}
      />
      <MultiFilter
        id="catalog-processing"
        label="Processing status"
        options={BOOK_PROCESSING_STATUS_FILTERS}
        selected={draft.processingStatuses}
        onChange={(processingStatuses) => setDraft({ ...draft, processingStatuses })}
      />
      {keywordError !== undefined ? <p className="text-sm text-destructive">{keywordError}</p> : null}
      {idError !== undefined ? <p className="text-sm text-destructive">{idError}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  readonly label: string;
  readonly htmlFor: string;
  readonly children: JSX.Element;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function MultiFilter({
  id,
  label,
  options,
  selected,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly options: readonly string[];
  readonly selected: readonly string[];
  readonly onChange: (nextValues: readonly string[]) => void;
}): JSX.Element {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isChecked: boolean = selected.includes(option);
          return (
            <label key={option} className="flex items-center gap-2 text-sm" htmlFor={`${id}-${option}`}>
              <input
                id={`${id}-${option}`}
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  onChange(
                    isChecked
                      ? selected.filter((value: string) => value !== option)
                      : [...selected, option],
                  );
                }}
              />
              {formatBookEnumLabel(option)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function toDraft(value: AdminBooksListSearch): CatalogDraft {
  return {
    q: value.q ?? '',
    categoryIds: value.categoryIds.join(', '),
    authorName: value.authorName ?? '',
    publisherName: value.publisherName ?? '',
    ownerIds: value.ownerIds.join(', '),
    bookTypes: value.bookTypes,
    layoutTypes: value.layoutTypes,
    publishingStatuses: value.publishingStatuses,
    processingStatuses: value.processingStatuses,
    catalogVisible: value.catalogVisible === undefined ? '' : String(value.catalogVisible),
    sortBy: value.sortBy ?? '',
    sortOrder: value.sortOrder ?? '',
  };
}

function parseDraft(draft: CatalogDraft): {
  readonly search?: Omit<AdminBooksListSearch, 'offset'>;
  readonly keywordError?: string;
  readonly idError?: string;
} {
  const keyword: string = draft.q.trim();
  if (keyword.length === 1) {
    return { keywordError: 'Enter at least 2 characters, or leave keyword empty.' };
  }
  const categoryIds: number[] | undefined = parseIdList(draft.categoryIds);
  const ownerIds: number[] | undefined = parseIdList(draft.ownerIds);
  if (categoryIds === undefined || ownerIds === undefined) {
    return { idError: 'Ids must be positive whole numbers separated by commas.' };
  }
  return {
    search: {
      q: keyword.length >= 2 ? keyword : undefined,
      categoryIds,
      authorName: emptyToUndefined(draft.authorName),
      publisherName: emptyToUndefined(draft.publisherName),
      ownerIds,
      bookTypes: draft.bookTypes,
      layoutTypes: draft.layoutTypes,
      publishingStatuses: draft.publishingStatuses,
      processingStatuses: draft.processingStatuses,
      catalogVisible: parseVisible(draft.catalogVisible),
      sortBy: emptyToUndefined(draft.sortBy),
      sortOrder: emptyToUndefined(draft.sortOrder),
    },
  };
}

function parseIdList(value: string): number[] | undefined {
  const trimmed: string = value.trim();
  if (trimmed === '') {
    return [];
  }
  const parts: string[] = trimmed.split(',').map((part: string) => part.trim()).filter((part: string) => part !== '');
  const ids: number[] = [];
  for (const part of parts) {
    const parsed: number = Number.parseInt(part, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || String(parsed) !== part) {
      return undefined;
    }
    ids.push(parsed);
  }
  return ids;
}

function parseVisible(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed: string = value.trim();
  return trimmed === '' ? undefined : trimmed;
}
