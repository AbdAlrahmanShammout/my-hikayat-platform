import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuthSession } from '@/features/auth/api/auth-session';
import { useEnablePublisherCapability } from '@/features/auth/hooks/use-enable-publisher-capability';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { getPostLoginPath } from '@/features/auth/lib/get-post-login-path';

/**
 * POST /user/publisher for a signed-in reader. The API assigns AUTHOR and isPublisher.
 */
export function EnablePublisherPanel(): JSX.Element {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const enableMutation = useEnablePublisherCapability();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Become a publisher</CardTitle>
        <CardDescription>
          This account is a reader. Enable publisher capability to open the author dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errorMessage !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="button"
          disabled={enableMutation.isPending}
          onClick={() => {
            void submitEnablePublisher(enableMutation.mutateAsync, setErrorMessage, (session) => {
              const homePath: string | null = getPostLoginPath(session.user.role);
              if (homePath !== null) {
                void navigate(homePath, { replace: true });
              }
            });
          }}
        >
          {enableMutation.isPending ? 'Enabling…' : 'Become a publisher'}
        </Button>
        <Button type="button" variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}

async function submitEnablePublisher(
  mutateAsync: ReturnType<typeof useEnablePublisherCapability>['mutateAsync'],
  setErrorMessage: (message: string | undefined) => void,
  onSuccess: (session: AuthSession) => void,
): Promise<void> {
  setErrorMessage(undefined);
  try {
    const session: AuthSession = await mutateAsync();
    onSuccess(session);
  } catch (error: unknown) {
    setErrorMessage(getUserFacingErrorMessage(error));
  }
}
