import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
 * POST /admin/invitations dialog. The raw token is shown only on this success.
 */
export function AdminInvitationCreateDialog(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [createdNotice, setCreatedNotice] = useState<CreatedInvitationNotice | null>(null);
  const handleOpenChange = (open: boolean): void => {
    if (!open && createdNotice !== null) {
      return;
    }
    setIsOpen(open);
  };
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Invite admin
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{createdNotice === null ? 'Invite admin' : 'Invitation sent'}</DialogTitle>
            <DialogDescription>
              {createdNotice === null
                ? 'Sends an official Noory email with a 7-day accept link. Admin cannot be granted from user edit.'
                : 'This accept link is shown once. Copy it before closing.'}
            </DialogDescription>
          </DialogHeader>
          {createdNotice !== null ? (
            <CreatedInvitationNoticePanel
              notice={createdNotice}
              onDone={() => {
                setCreatedNotice(null);
                setIsOpen(false);
              }}
            />
          ) : isOpen ? (
            <AdminInvitationCreateForm
              onCancel={() => setIsOpen(false)}
              onCreated={setCreatedNotice}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminInvitationCreateFormProps = {
  readonly onCancel: () => void;
  readonly onCreated: (notice: CreatedInvitationNotice) => void;
};

function AdminInvitationCreateForm({
  onCancel,
  onCreated,
}: AdminInvitationCreateFormProps): JSX.Element {
  const createMutation = useCreateAdminInvitation();
  const form = useForm<AdminInvitationCreateFormValues>({
    resolver: zodResolver(adminInvitationCreateFormSchema),
    defaultValues: { email: '' },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          void submitCreateInvitation(values, createMutation.mutateAsync, form.setError, onCreated);
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
                  disabled={createMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Sending…' : 'Send invitation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreatedInvitationNoticePanel({
  notice,
  onDone,
}: {
  readonly notice: CreatedInvitationNotice;
  readonly onDone: () => void;
}): JSX.Element {
  const [didCopy, setDidCopy] = useState<boolean>(false);
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription className="space-y-2">
          <p>Official invitation email sent to {notice.email}.</p>
          <p className="break-all text-muted-foreground">{notice.acceptUrl}</p>
        </AlertDescription>
      </Alert>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void copyAcceptUrl(notice.acceptUrl, setDidCopy);
          }}
        >
          {didCopy ? 'Copied' : 'Copy accept link'}
        </Button>
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
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
