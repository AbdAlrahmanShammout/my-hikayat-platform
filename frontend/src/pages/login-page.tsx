import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';
import { Navigate } from 'react-router';

import { PageSkeleton } from '@/components/page-skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForbiddenPanel } from '@/features/auth/components/forbidden-panel';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAccessToken } from '@/features/auth/hooks/use-access-token';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { getPostLoginPath } from '@/features/auth/lib/get-post-login-path';

/**
 * Public sign-in screen. Signed-in authors and admins go to their dashboard.
 */
export function LoginPage(): JSX.Element {
  const accessToken: string | null = useAccessToken();
  const currentUserQuery = useCurrentUser();
  const shouldReduceMotion: boolean | null = useReducedMotion();
  if (accessToken !== null && currentUserQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <PageSkeleton />
      </div>
    );
  }
  if (currentUserQuery.data !== undefined) {
    const homePath: string | null = getPostLoginPath(currentUserQuery.data.role);
    if (homePath !== null) {
      return <Navigate to={homePath} replace />;
    }
    return (
      <ForbiddenPanel
        title="This dashboard is not available"
        description="This web app is for authors and administrators. Your account does not have those roles."
      />
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <motion.div
        className="w-full max-w-md"
        initial={shouldReduceMotion === true ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion === true ? 0 : 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Noory</CardTitle>
            <CardDescription>
              Authors and administrators use the same email and password as the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
