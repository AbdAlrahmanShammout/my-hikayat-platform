/**
 * Authenticated principal from GET /auth/me and auth session payloads.
 */
export type UserRole = 'reader' | 'author' | 'admin';

export type User = {
  readonly id: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isPublisher: boolean;
};

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

export type SessionValue = {
  readonly status: SessionStatus;
  readonly user: User | null;
  readonly errorMessage: string | null;
  readonly signIn: (input: { readonly email: string; readonly password: string }) => Promise<void>;
  readonly signUp: (input: { readonly email: string; readonly password: string }) => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly clearError: () => void;
};
