import type { FormEvent, JSX } from 'react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import {
  ADMIN_SEARCH_TYPES,
  type AdminSearchResponse,
  type AdminSearchType,
} from '@/features/search/api/search-admin';
import { useAdminSearch } from '@/features/search/hooks/use-admin-search';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { formatReadingAccessState } from '@/features/users/lib/format-reading-access-state';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

const GROUP_LIMIT = 8;

/**
 * Global admin search. EPUB authors are metadata strings and have no account id.
 */
export function AdminSearchPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword: string = searchParams.get('q')?.trim() ?? '';
  const typeValue: string | null = searchParams.get('type');
  const type: AdminSearchType | undefined = isSearchType(typeValue) ? typeValue : undefined;
  const offset: number = type === undefined ? 0 : (parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0);
  const canSearch: boolean = keyword.length >= 2 && keyword.length <= 80;
  const searchQuery = useAdminSearch(
    {
      q: keyword,
      type,
      limit: type === undefined ? GROUP_LIMIT : ADMIN_LIST_PAGE_SIZE,
      offset: type === undefined ? 0 : offset,
    },
    canSearch,
  );
  return (
    <div className="space-y-6">
      <SearchForm
        key={`${keyword}:${type ?? ''}`}
        keyword={keyword}
        type={type}
        onApply={(nextKeyword: string, nextType: AdminSearchType | undefined) => {
          const params: URLSearchParams = new URLSearchParams();
          params.set('q', nextKeyword);
          if (nextType !== undefined) {
            params.set('type', nextType);
          }
          setSearchParams(params, { replace: true });
        }}
      />
      {!canSearch ? (
        <EmptyState
          title="Enter a search"
          description="Use at least 2 characters. Search covers users, books, EPUB authors, publisher accounts, categories, and subscriptions."
        />
      ) : null}
      {canSearch && searchQuery.isPending ? <Skeleton className="h-40 w-full" /> : null}
      {canSearch && searchQuery.isError ? (
        <ErrorState
          message={getUserFacingErrorMessage(searchQuery.error)}
          onRetry={() => {
            void searchQuery.refetch();
          }}
        />
      ) : null}
      {canSearch && searchQuery.data !== undefined ? (
        <SearchResults
          result={searchQuery.data}
          type={type}
          offset={offset}
          onOffsetChange={(nextOffset: number) => {
            const params: URLSearchParams = new URLSearchParams(searchParams);
            if (nextOffset > 0) {
              params.set('offset', String(nextOffset));
            } else {
              params.delete('offset');
            }
            setSearchParams(params, { replace: true });
          }}
        />
      ) : null}
    </div>
  );
}

function SearchForm({
  keyword,
  type,
  onApply,
}: {
  readonly keyword: string;
  readonly type: AdminSearchType | undefined;
  readonly onApply: (keyword: string, type: AdminSearchType | undefined) => void;
}): JSX.Element {
  const [draft, setDraft] = useState<string>(keyword);
  const [typeDraft, setTypeDraft] = useState<string>(type ?? '');
  const [error, setError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed: string = draft.trim();
        if (trimmed.length < 2 || trimmed.length > 80) {
          setError('Enter 2 to 80 characters.');
          return;
        }
        setError(undefined);
        onApply(trimmed, isSearchType(typeDraft) ? typeDraft : undefined);
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-search-q">Keyword</Label>
        <Input id="admin-search-q" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-search-type">Type</Label>
        <Select id="admin-search-type" value={typeDraft} onChange={(event) => setTypeDraft(event.target.value)}>
          <option value="">All types</option>
          {ADMIN_SEARCH_TYPES.map((item) => (
            <option key={item} value={item}>
              {searchTypeLabel(item)}
            </option>
          ))}
        </Select>
      </div>
      {error !== undefined ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}

function SearchResults({
  result,
  type,
  offset,
  onOffsetChange,
}: {
  readonly result: AdminSearchResponse;
  readonly type: AdminSearchType | undefined;
  readonly offset: number;
  readonly onOffsetChange: (offset: number) => void;
}): JSX.Element {
  const visibleTotal: number =
    result.users.total +
    result.books.total +
    result.epubAuthors.total +
    result.publishers.total +
    result.categories.total +
    result.subscriptions.total;
  if (visibleTotal === 0) {
    return (
      <EmptyState title="No matches" description={`Nothing matched “${result.query}”.`} />
    );
  }
  return (
    <div className="space-y-8">
      <UserGroup title="Users" items={result.users.items} total={result.users.total} />
      <BookGroup items={result.books.items} total={result.books.total} />
      <EpubAuthorGroup items={result.epubAuthors.items} total={result.epubAuthors.total} />
      <PublisherGroup items={result.publishers.items} total={result.publishers.total} />
      <CategoryGroup items={result.categories.items} total={result.categories.total} />
      <SubscriptionGroup items={result.subscriptions.items} total={result.subscriptions.total} />
      {type !== undefined ? (
        <ListPagination
          offset={offset}
          limit={ADMIN_LIST_PAGE_SIZE}
          total={groupTotal(result, type)}
          onOffsetChange={onOffsetChange}
        />
      ) : null}
    </div>
  );
}

function UserGroup({
  title,
  items,
  total,
}: {
  readonly title: string;
  readonly items: AdminSearchResponse['users']['items'];
  readonly total: number;
}): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{`${title} (${String(total)})`}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((user) => (
          <li key={user.id}>
            <Link className="underline-offset-4 hover:underline" to={`/admin/users/${user.id}`}>
              {user.email}
            </Link>
            <span className="text-muted-foreground">{` · ${user.role}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BookGroup({
  items,
  total,
}: {
  readonly items: AdminSearchResponse['books']['items'];
  readonly total: number;
}): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{`Books (${String(total)})`}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((book) => (
          <li key={book.id}>
            <Link className="underline-offset-4 hover:underline" to={`/admin/books/${book.id}`}>
              {book.title}
            </Link>
            <p className="text-muted-foreground">
              {`${formatBookEnumLabel(book.publishingStatus)} · EPUB creator: ${book.authorName ?? 'none'} · EPUB publisher metadata: ${book.publisherName ?? 'none'}`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EpubAuthorGroup({
  items,
  total,
}: {
  readonly items: AdminSearchResponse['epubAuthors']['items'];
  readonly total: number;
}): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{`EPUB authors (${String(total)})`}</h2>
      <p className="text-sm text-muted-foreground">
        These are creator strings from book metadata. They are not user accounts and have no id.
      </p>
      <ul className="space-y-2 text-sm">
        {items.map((author) => (
          <li key={author.creator}>
            <Link
              className="underline-offset-4 hover:underline"
              to={`/admin/books?authorName=${encodeURIComponent(author.creator)}`}
            >
              {author.creator}
            </Link>
            <span className="text-muted-foreground">{` · ${String(author.bookCount)} books`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PublisherGroup({
  items,
  total,
}: {
  readonly items: AdminSearchResponse['publishers']['items'];
  readonly total: number;
}): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{`Publisher accounts (${String(total)})`}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((publisher) => (
          <li key={publisher.id}>
            <Link className="underline-offset-4 hover:underline" to={`/admin/publishers/${publisher.id}`}>
              {publisher.email}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryGroup({
  items,
  total,
}: {
  readonly items: AdminSearchResponse['categories']['items'];
  readonly total: number;
}): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{`Categories (${String(total)})`}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((category) => (
          <li key={category.id}>
            <Link className="underline-offset-4 hover:underline" to="/admin/categories">
              {category.name}
            </Link>
            <span className="text-muted-foreground">{` · ${category.slug}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SubscriptionGroup({
  items,
  total,
}: {
  readonly items: AdminSearchResponse['subscriptions']['items'];
  readonly total: number;
}): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{`Subscriptions (${String(total)})`}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((subscription) => (
          <li key={subscription.id}>
            <Link
              className="underline-offset-4 hover:underline"
              to={`/admin/subscriptions/${subscription.id}`}
            >
              {subscription.userEmail}
            </Link>
            <span className="text-muted-foreground">
              {` · ${subscription.planName} · ${formatReadingAccessState(subscription.readingAccessState)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function groupTotal(result: AdminSearchResponse, type: AdminSearchType): number {
  return result[type].total;
}

function searchTypeLabel(type: AdminSearchType): string {
  if (type === 'epubAuthors') {
    return 'EPUB authors';
  }
  if (type === 'publishers') {
    return 'Publisher accounts';
  }
  return type;
}

function isSearchType(value: string | null): value is AdminSearchType {
  return ADMIN_SEARCH_TYPES.some((type) => type === value);
}
