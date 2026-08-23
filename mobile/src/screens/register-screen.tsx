import { router } from 'expo-router';
import type { JSX } from 'react';

import { RegisterForm } from '@/features/auth/components/register-form';

/**
 * Route-level register screen.
 */
export function RegisterScreen(): JSX.Element {
  return (
    <RegisterForm
      onOpenLogin={() => {
        router.replace('/(public)/sign-in');
      }}
    />
  );
}
