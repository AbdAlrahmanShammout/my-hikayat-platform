import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { useAcceptAdminInvitation } from '@/features/auth/hooks/use-accept-admin-invitation';
import {
  acceptAdminInvitationFormSchema,
  type AcceptAdminInvitationFormValues,
} from '@/features/auth/schemas/accept-admin-invitation-form.schema';

type AcceptAdminInvitationFormProps = {
  readonly token: string;
};

/**
 * Password form for POST /auth/accept-admin-invitation. Token stays in the URL, not the form.
 */
export function AcceptAdminInvitationForm({ token }: AcceptAdminInvitationFormProps): JSX.Element {
  const navigate = useNavigate();
  const acceptMutation = useAcceptAdminInvitation();
  const form = useForm<AcceptAdminInvitationFormValues>({
    resolver: zodResolver(acceptAdminInvitationFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          void submitAcceptInvitation(
            token,
            values,
            acceptMutation.mutateAsync,
            form.setError,
            () => {
              void navigate('/admin', { replace: true });
            },
          );
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={acceptMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {PASSWORD_LENGTH.min}–{PASSWORD_LENGTH.max} characters. This becomes the admin
                sign-in password.
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
                  disabled={acceptMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={acceptMutation.isPending}>
          {acceptMutation.isPending ? 'Accepting…' : 'Accept invitation'}
        </Button>
      </form>
    </Form>
  );
}

async function submitAcceptInvitation(
  token: string,
  values: AcceptAdminInvitationFormValues,
  mutateAsync: ReturnType<typeof useAcceptAdminInvitation>['mutateAsync'],
  setError: UseFormSetError<AcceptAdminInvitationFormValues>,
  onSuccess: () => void,
): Promise<void> {
  try {
    await mutateAsync({ token, password: values.password });
    onSuccess();
  } catch (error: unknown) {
    applyAcceptInvitationServerError(error, setError);
  }
}

function applyAcceptInvitationServerError(
  error: unknown,
  setError: UseFormSetError<AcceptAdminInvitationFormValues>,
): void {
  applyValidationFieldErrors(error, setError);
  setError('root', { message: getUserFacingErrorMessage(error) });
}

function applyValidationFieldErrors(
  error: unknown,
  setError: UseFormSetError<AcceptAdminInvitationFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (item.property !== 'password') {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}
