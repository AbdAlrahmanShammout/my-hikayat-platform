import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PASSWORD_LENGTH } from '@/config/password-length';
import type { AuthSession } from '@/features/auth/api/auth-session';
import { useRegisterAsAuthor } from '@/features/auth/hooks/use-register-as-author';
import { getPostLoginPath } from '@/features/auth/lib/get-post-login-path';
import {
  registerAuthorFormSchema,
  type RegisterAuthorFormValues,
} from '@/features/auth/schemas/register-author-form.schema';

/**
 * Public register then POST /user/publisher. There is no author-only register API.
 */
export function RegisterAuthorForm(): JSX.Element {
  const navigate = useNavigate();
  const registerMutation = useRegisterAsAuthor();
  const form = useForm<RegisterAuthorFormValues>({
    resolver: zodResolver(registerAuthorFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          void submitRegister(values, registerMutation.mutateAsync, form.setError, (session) => {
            const homePath: string | null = getPostLoginPath(session.user.role);
            if (homePath !== null) {
              void navigate(homePath, { replace: true });
            }
          });
        })}
        noValidate
      >
        {rootMessage !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>{rootMessage}</AlertDescription>
          </Alert>
        ) : null}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {PASSWORD_LENGTH.min}–{PASSWORD_LENGTH.max} characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account…' : 'Create author account'}
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Already have an account? Sign in</Link>
        </Button>
      </form>
    </Form>
  );
}

async function submitRegister(
  values: RegisterAuthorFormValues,
  mutateAsync: ReturnType<typeof useRegisterAsAuthor>['mutateAsync'],
  setError: UseFormSetError<RegisterAuthorFormValues>,
  onSuccess: (session: AuthSession) => void,
): Promise<void> {
  try {
    const session: AuthSession = await mutateAsync({
      email: values.email,
      password: values.password,
    });
    onSuccess(session);
  } catch (error: unknown) {
    applyRegisterServerError(error, setError);
  }
}

function applyRegisterServerError(
  error: unknown,
  setError: UseFormSetError<RegisterAuthorFormValues>,
): void {
  applyValidationFieldErrors(error, setError);
  setError('root', { message: getUserFacingErrorMessage(error) });
}

function applyValidationFieldErrors(
  error: unknown,
  setError: UseFormSetError<RegisterAuthorFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (item.property !== 'email' && item.property !== 'password') {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}
