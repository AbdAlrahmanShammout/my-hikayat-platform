import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
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
import { Select } from '@/components/ui/select';
import { useUpdateAdminUser } from '@/features/users/hooks/use-update-admin-user';
import { formatUserRoleLabel } from '@/features/users/lib/format-user-role-label';
import type { AdminUserActionAvailability } from '@/features/users/lib/get-admin-user-action-availability';
import { resolvePublisherForRole } from '@/features/users/lib/resolve-publisher-for-role';
import {
  adminUserEditFormSchema,
  type AdminUserEditFormValues,
} from '@/features/users/schemas/admin-user-edit-form.schema';
import type { components } from '@/generated/admin';
import { USER_ROLES, type UserRole } from '@/types/user-role';

type AdminUserEditFormProps = {
  readonly user: components['schemas']['UserResponse'];
  readonly availability: AdminUserActionAvailability;
};

/**
 * PATCH /admin/users/:id form. Only role and isPublisher.
 */
export function AdminUserEditForm({
  user,
  availability,
}: AdminUserEditFormProps): JSX.Element {
  const updateMutation = useUpdateAdminUser();
  const form = useForm<AdminUserEditFormValues>({
    resolver: zodResolver(adminUserEditFormSchema),
    defaultValues: {
      role: user.role,
      isPublisher: user.isPublisher,
    },
  });
  const selectedRole: UserRole = form.watch('role');
  const isPublisherLocked: boolean = selectedRole !== USER_ROLES.ADMIN;
  const isFormDisabled: boolean = !availability.canUpdate || updateMutation.isPending;
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role and publisher</CardTitle>
        <CardDescription>
          Reader cannot be a publisher. Author is always a publisher. The backend still enforces
          this.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availability.updateDisabledReason !== null ? (
          <Alert className="mb-4">
            <AlertDescription>{availability.updateDisabledReason}</AlertDescription>
          </Alert>
        ) : null}
        {!availability.canLeaveAdminRole &&
        availability.canUpdate &&
        availability.deleteDisabledReason !== null ? (
          <Alert className="mb-4">
            <AlertDescription>{availability.deleteDisabledReason}</AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitUserEdit(user.id, values, updateMutation.mutateAsync, form.setError);
            })}
            noValidate
          >
            {rootMessage !== undefined ? (
              <Alert variant="destructive">
                <AlertDescription>{rootMessage}</AlertDescription>
              </Alert>
            ) : null}
            {form.formState.isSubmitSuccessful ? (
              <Alert>
                <AlertDescription>User saved.</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isFormDisabled || !availability.canLeaveAdminRole}
                      value={field.value}
                      onBlur={field.onBlur}
                      name={field.name}
                      onChange={(event) => {
                        const nextRole: UserRole = event.target.value as UserRole;
                        field.onChange(nextRole);
                        form.setValue(
                          'isPublisher',
                          resolvePublisherForRole(nextRole, form.getValues('isPublisher')),
                        );
                      }}
                    >
                      <option value={USER_ROLES.READER}>
                        {formatUserRoleLabel(USER_ROLES.READER)}
                      </option>
                      <option value={USER_ROLES.AUTHOR}>
                        {formatUserRoleLabel(USER_ROLES.AUTHOR)}
                      </option>
                      <option value={USER_ROLES.ADMIN}>
                        {formatUserRoleLabel(USER_ROLES.ADMIN)}
                      </option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublisher"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={field.value}
                      disabled={isFormDisabled || isPublisherLocked}
                      onChange={(event) => {
                        field.onChange(event.target.checked);
                      }}
                    />
                    Publisher capability
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isFormDisabled}>
              {updateMutation.isPending ? 'Saving…' : 'Save user'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitUserEdit(
  userId: number,
  values: AdminUserEditFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminUser>['mutateAsync'],
  setError: UseFormSetError<AdminUserEditFormValues>,
): Promise<void> {
  try {
    await mutateAsync({
      userId,
      body: {
        role: values.role,
        isPublisher: values.isPublisher,
      },
    });
  } catch (error: unknown) {
    applyUserEditServerError(error, setError);
  }
}

function applyUserEditServerError(
  error: unknown,
  setError: UseFormSetError<AdminUserEditFormValues>,
): void {
  applyValidationFieldErrors(error, setError);
  setError('root', { message: getUserFacingErrorMessage(error) });
}

function applyValidationFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminUserEditFormValues>,
): void {
  if (!(error instanceof ApiError)) {
    return;
  }
  for (const item of error.validationErrorObjects) {
    if (item.property !== 'role' && item.property !== 'isPublisher') {
      continue;
    }
    const firstConstraint: string | undefined = Object.values(item.constraints)[0];
    if (firstConstraint !== undefined) {
      setError(item.property, { message: firstConstraint });
    }
  }
}
