/**
 * Structured query keys for reader server state.
 */
export const queryKeys = {
  session: {
    currentUser: ['reader', 'session', 'current-user'] as const,
  },
  catalog: {
    books: (input: {
      readonly limit?: number;
      readonly offset?: number;
      readonly categoryId?: number;
      readonly sort?: 'newest' | 'popularity';
    }) => ['reader', 'catalog', 'books', input] as const,
    book: (bookId: number) => ['reader', 'catalog', 'book', bookId] as const,
    categories: (input: { readonly limit?: number; readonly offset?: number }) =>
      ['reader', 'catalog', 'categories', input] as const,
  },
  search: {
    books: (input: {
      readonly limit?: number;
      readonly offset?: number;
      readonly title?: string;
      readonly author?: string;
      readonly publisher?: string;
    }) => ['reader', 'search', 'books', input] as const,
  },
  collections: {
    list: (input: { readonly limit?: number; readonly offset?: number }) =>
      ['reader', 'collections', 'list', input] as const,
    detail: (collectionId: number) => ['reader', 'collections', 'detail', collectionId] as const,
  },
  reader: {
    openShell: (bookId: number) => ['reader', 'reading', 'open-shell', bookId] as const,
    currentSession: (bookId: number) => ['reader', 'reading', 'session', 'current', bookId] as const,
  },
  offline: {
    packages: ['reader', 'offline', 'packages'] as const,
    package: (bookId: number) => ['reader', 'offline', 'package', bookId] as const,
  },
} as const;
