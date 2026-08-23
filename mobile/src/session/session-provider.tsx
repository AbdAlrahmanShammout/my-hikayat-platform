import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from 'react';

import { ApiError } from '@/api/api-error';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { login } from '@/features/auth/api/login';
import { register } from '@/features/auth/api/register';
import type { AuthSession } from '@/features/auth/auth.types';
import {
  clearAccessToken,
  hydrateSessionStore,
  readAccessToken,
  subscribeAccessToken,
  writeAccessToken,
} from '@/session/session-store';
import type { SessionStatus, SessionValue, User } from '@/session/session.types';

export const SessionContext = createContext<SessionValue | null>(null);

type SessionProviderProps = {
  readonly children: ReactNode;
};

/**
 * Owns hydrate → /auth/me gate, login/register session writes, and sign-out.
 */
export function SessionProvider({ children }: SessionProviderProps): JSX.Element {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshFromToken = useCallback(async (): Promise<void> => {
    const accessToken: string | null = readAccessToken();
    if (accessToken === null) {
      setUser(null);
      setStatus('signedOut');
      return;
    }
    try {
      const currentUser: User = await getCurrentUser();
      setUser(currentUser);
      setStatus('signedIn');
      setErrorMessage(null);
    } catch (error: unknown) {
      setUser(null);
      setStatus('signedOut');
      if (!(error instanceof ApiError && error.isUnauthenticated)) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not restore your session.');
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      await hydrateSessionStore();
      if (!isMounted) {
        return;
      }
      await refreshFromToken();
    })();
    const unsubscribe = subscribeAccessToken(() => {
      if (readAccessToken() === null) {
        setUser(null);
        setStatus('signedOut');
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [refreshFromToken]);

  const applySession = useCallback(async (session: AuthSession): Promise<void> => {
    await writeAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('signedIn');
    setErrorMessage(null);
  }, []);

  const signIn = useCallback(
    async (input: { readonly email: string; readonly password: string }): Promise<void> => {
      setErrorMessage(null);
      try {
        const session: AuthSession = await login(input);
        await applySession(session);
      } catch (error: unknown) {
        setErrorMessage(toUserFacingMessage(error, 'Could not sign in. Check your email and password.'));
        throw error;
      }
    },
    [applySession],
  );

  const signUp = useCallback(
    async (input: { readonly email: string; readonly password: string }): Promise<void> => {
      setErrorMessage(null);
      try {
        const session: AuthSession = await register(input);
        await applySession(session);
      } catch (error: unknown) {
        setErrorMessage(toUserFacingMessage(error, 'Could not create your account.'));
        throw error;
      }
    },
    [applySession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await clearAccessToken();
    setUser(null);
    setStatus('signedOut');
    setErrorMessage(null);
  }, []);

  const clearError = useCallback((): void => {
    setErrorMessage(null);
  }, []);

  const value: SessionValue = useMemo(
    () => ({
      status,
      user,
      errorMessage,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [status, user, errorMessage, signIn, signUp, signOut, clearError],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function toUserFacingMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return fallback;
}
