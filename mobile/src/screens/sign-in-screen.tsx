import { router, type Href } from 'expo-router';
import type { JSX } from 'react';

import { LoginForm } from '@/features/auth/components/login-form';

/**
 * Route-level sign-in screen.
 */
export function SignInScreen(): JSX.Element {
  return (
    <LoginForm
      onOpenRegister={() => {
        router.push('/(public)/register');
      }}
      onOpenForgotPassword={() => {
        router.push('/(public)/forgot-password' as Href);
      }}
    />
  );
}
