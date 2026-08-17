import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateAdminInvitation } from '@/features/invitations/hooks/use-create-admin-invitation';
import { buildAdminInvitationAcceptUrl } from '@/features/invitations/lib/build-admin-invitation-accept-url';
import {
  adminInvitationCreateFormSchema,
  type AdminInvitationCreateFormValues,
} from '@/features/invitations/schemas/admin-invitation-create-form.schema';
import type { components } from '@/generated/admin';

type CreatedInvitationNotice = {
  readonly email: string;
  readonly acceptUrl: string;
};

/**
 * POST /admin/invitations form. The raw token is shown only on this success.
 */
export function AdminInvitationCreateForm(): JSX.Element {
  const createMutation = useCreateAdminInvitation();
  const [createdNotice, setCreatedNotice] = useState<CreatedInvitationNotice | null>(null);
  const form = useForm<AdminInvitationCreateFormValues>({
    resolver: zodResolver(adminInvitationCreateFormSchema),
    defaultValues: { email: '' },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite admin</CardTitle>
        <CardDescription>
          Sends an official Noory email with a 7-day accept link. Admin cannot be granted from user
          edit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {createdNotice !== null ? (
          <CreatedInvitationAlert key={createdNotice.acceptUrl} notice={createdNotice} />
        ) : null}
        <Form {...form}>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={form.handleSubmit((values) => {
              setCreatedNotice(null);
              void submitCreateInvitation(
                values,
                createMutation.mutateAsync,
                form.setError,
                (notice) => {
                  form.reset({ email: '' });
                  setCreatedNotice(notice);
                },
              );
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive" className="sm:min-w-full">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      disabled={createMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Sending…' : 'Send invitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function CreatedInvitationAlert({
  notice,
}: {
  readonly notice: CreatedInvitationNotice;
}): JSX.Element {
  const [didCopy, setDidCopy] = useState<boolean>(false);
  return (
    <Alert>
      <AlertDescription className="space-y-2">
        <p>Official invitation email sent to {notice.email}.</p>
        <p className="break-all text-muted-foreground">{notice.acceptUrl}</p>
        <p>This accept link is shown once here. It is not listed again.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void copyAcceptUrl(notice.acceptUrl, setDidCopy);
          }}
        >
          {didCopy ? 'Copied' : 'Copy accept link'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

async function submitCreateInvitation(
  values: AdminInvitationCreateFormValues,
  mutateAsync: ReturnType<typeof useCreateAdminInvitation>['mutateAsync'],
  setError: UseFormSetError<AdminInvitationCreateFormValues>,
  onCreated: (notice: CreatedInvitationNotice) => void,
): Promise<void> {
  try {
    const created: components['schemas']['CreateAdminInvitationResponseDto'] = await mutateAsync({
      email: values.email,
    });
    onCreated({
      email: created.invitation.email,
      acceptUrl: buildAdminInvitationAcceptUrl({
        origin: window.location.origin,
        token: created.token,
      }),
    });
  } catch (error: unknown) {
    applyInvitationServerError(error, setError);
  }
}

function applyInvitationServerError(
  error: unknown,
  setError: UseFormSetError<AdminInvitationCreateFormValues>,
): void {
  if (error instanceof ApiError) {
    for (const item of error.validationErrorObjects) {
      if (item.property !== 'email') {
        continue;
      }
      const firstConstraint: string | undefined = Object.values(item.constraints)[0];
      if (firstConstraint !== undefined) {
        setError('email', { message: firstConstraint });
      }
    }
  }
  setError('root', { message: getUserFacingErrorMessage(error) });
}

async function copyAcceptUrl(
  acceptUrl: string,
  setDidCopy: (didCopy: boolean) => void,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(acceptUrl);
    setDidCopy(true);
  } catch {
    setDidCopy(false);
  }
}
