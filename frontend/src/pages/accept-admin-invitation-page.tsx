import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AcceptAdminInvitationForm } from '@/features/auth/components/accept-admin-invitation-form';
import { parseAdminInvitationToken } from '@/features/auth/lib/parse-admin-invitation-token';

/**
 * Public invitation accept screen. Token comes from the emailed link.
 */
export function AcceptAdminInvitationPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const token: string | null = parseAdminInvitationToken(searchParams);
  const shouldReduceMotion: boolean | null = useReducedMotion();
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <motion.div
        className="w-full max-w-md"
        initial={shouldReduceMotion === true ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion === true ? 0 : 0.2 }}
      >
        {token === null ? <MissingInvitationTokenCard /> : <AcceptInvitationCard token={token} />}
      </motion.div>
    </div>
  );
}

function MissingInvitationTokenCard(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation link is incomplete</CardTitle>
        <CardDescription>
          This page needs the token from the official Noory invitation email. Open the link in that
          email, or ask an administrator to send a new invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to="/login">Go to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AcceptInvitationCard({ token }: { readonly token: string }): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept admin invitation</CardTitle>
        <CardDescription>
          Set a password for the invited Noory admin account. The invitation email is already on the
          invite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AcceptAdminInvitationForm token={token} />
      </CardContent>
    </Card>
  );
}
