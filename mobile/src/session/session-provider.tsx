import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearAuthenticatedCache = useCallback((): void => {
    queryClient.clear();
  }, [queryClient]);

  const applySignedOut = useCallback((): void => {
    setUser(null);
    setStatus('signedOut');
    clearAuthenticatedCache();
  }, [clearAuthenticatedCache]);

  const refreshFromToken = useCallback(async (): Promise<void> => {
    const accessToken: string | null = readAccessToken();
    if (accessToken === null) {
      applySignedOut();
      setErrorMessage(null);
      return;
    }
    try {
      const currentUser: User = await getCurrentUser();
      setUser(currentUser);
      setStatus('signedIn');
      setErrorMessage(null);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.isUnauthenticated) {
        applySignedOut();
        setErrorMessage(null);
        return;
      }
      setUser(null);
      setStatus('restoreFailed');
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not restore your session. Check your connection.',
      );
    }
  }, [applySignedOut]);

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
        clearAuthenticatedCache();
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [refreshFromToken, clearAuthenticatedCache]);

  const applySession = useCallback(async (session: AuthSession): Promise<void> => {
    await writeAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('signedIn');
    setErrorMessage(null);
  }, []);

  const signIn = useCallback(
    async (input: { readonly email: string; readonly password: string }): Promise<void> => {
      setErrorMessage(null);
      const session: AuthSession = await login(input);
      await applySession(session);
    },
    [applySession],
  );

  const signUp = useCallback(
    async (input: { readonly email: string; readonly password: string }): Promise<void> => {
      setErrorMessage(null);
      const session: AuthSession = await register(input);
      await applySession(session);
    },
    [applySession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await clearAccessToken();
    applySignedOut();
    setErrorMessage(null);
  }, [applySignedOut]);

  const retryRestore = useCallback(async (): Promise<void> => {
    setStatus('loading');
    setErrorMessage(null);
    await refreshFromToken();
  }, [refreshFromToken]);

  const abandonRestore = useCallback(async (): Promise<void> => {
    await clearAccessToken();
    applySignedOut();
    setErrorMessage(null);
  }, [applySignedOut]);

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
      retryRestore,
      abandonRestore,
      clearError,
    }),
    [status, user, errorMessage, signIn, signUp, signOut, retryRestore, abandonRestore, clearError],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
