import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';
import { Navigate } from 'react-router';

import { PageSkeleton } from '@/components/page-skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnablePublisherPanel } from '@/features/auth/components/enable-publisher-panel';
import { RegisterAuthorForm } from '@/features/auth/components/register-author-form';
import { useAccessToken } from '@/features/auth/hooks/use-access-token';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { getPostLoginPath } from '@/features/auth/lib/get-post-login-path';

/**
 * Public author-account screen. Register creates a reader; publisher enable is a second API call.
 */
export function RegisterPage(): JSX.Element {
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
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md">
          <EnablePublisherPanel />
        </div>
      </div>
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
            <CardTitle>Create an author account</CardTitle>
            <CardDescription>
              Create an email and password. You can then open the author dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterAuthorForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
