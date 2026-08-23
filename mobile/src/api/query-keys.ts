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
} as const;
