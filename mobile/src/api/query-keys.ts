/**
 * Structured query keys for reader server state.
 */
export const queryKeys = {
  session: {
    currentUser: ['reader', 'session', 'current-user'] as const,
  },
} as const;
