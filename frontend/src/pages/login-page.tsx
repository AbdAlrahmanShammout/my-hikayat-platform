import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';
import { Navigate } from 'react-router';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageSkeleton } from '@/components/page-skeleton';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAccessToken } from '@/features/auth/hooks/use-access-token';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { USER_ROLES } from '@/types/user-role';

/**
 * Public sign-in screen. Admins already in session go to /admin.
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
  if (currentUserQuery.data?.role === USER_ROLES.ADMIN) {
    return <Navigate to="/admin" replace />;
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
            <CardDescription>Admin access uses the same email and password as the API.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
