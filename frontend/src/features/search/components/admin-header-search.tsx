import type { FormEvent, JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Sends the header keyword to the global admin search page.
 */
export function AdminHeaderSearch(): JSX.Element {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);
  return (
    <form
      className="ml-auto hidden min-w-0 flex-1 items-center gap-2 lg:flex"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed: string = keyword.trim();
        if (trimmed.length < 2) {
          setError('Enter at least 2 characters.');
          return;
        }
        setError(undefined);
        void navigate(`/admin/search?q=${encodeURIComponent(trimmed)}`);
      }}
    >
      <Label htmlFor="admin-header-search" className="sr-only">
        Search admin
      </Label>
      <Input
        id="admin-header-search"
        value={keyword}
        className="max-w-sm"
        placeholder="Search users, books, publishers"
        aria-invalid={error !== undefined}
        onChange={(event) => {
          setKeyword(event.target.value);
          setError(undefined);
        }}
      />
      <Button type="submit" variant="outline">
        Search
      </Button>
      {error !== undefined ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
