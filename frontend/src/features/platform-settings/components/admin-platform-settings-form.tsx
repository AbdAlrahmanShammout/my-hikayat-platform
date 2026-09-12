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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAdminPlatformSettings } from '@/features/platform-settings/hooks/use-update-admin-platform-settings';
import {
  AUTH_COVER_MEDIA_ASPECT_HINT,
  adminPlatformSettingsFormSchema,
  type AdminPlatformSettingsFormValues,
} from '@/features/platform-settings/schemas/admin-platform-settings-form.schema';
import type { components } from '@/generated/admin';

type AdminPlatformSettingsFormProps = {
  readonly settings: components['schemas']['PlatformSettingsResponse'];
};

/**
 * PATCH /admin/platform-settings form for reader-facing legal, About, and auth chrome.
 */
export function AdminPlatformSettingsForm({
  settings,
}: AdminPlatformSettingsFormProps): JSX.Element {
  const updateMutation = useUpdateAdminPlatformSettings();
  const form = useForm<AdminPlatformSettingsFormValues>({
    resolver: zodResolver(adminPlatformSettingsFormSchema),
    defaultValues: {
      privacyPolicyUrl: settings.privacyPolicyUrl ?? '',
      termsOfServiceUrl: settings.termsOfServiceUrl ?? '',
      aboutMission: settings.aboutMission ?? '',
      authCoverMediaUrl: settings.authCoverMediaUrl ?? '',
    },
  });
  const rootMessage: string | undefined = form.formState.errors.root?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reader app settings</CardTitle>
        <CardDescription>
          These values appear in the reader app. Leave a URL blank to hide that destination until
          you set one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              void submitPlatformSettings(values, updateMutation.mutateAsync, form.setError);
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
                <AlertDescription>Settings saved.</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              control={form.control}
              name="privacyPolicyUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy Policy URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/privacy"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Opened from Me, Settings, About, and Sign up.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="termsOfServiceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms of Service URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/terms"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Opened from Settings, About, and Sign up.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aboutMission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About mission</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short mission for the About screen"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown on About My Hikayat. Leave blank to use the built-in one-line product
                    description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authCoverMediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sign in cover GIF or video URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/auth-cover.gif"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{AUTH_COVER_MEDIA_ASPECT_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function submitPlatformSettings(
  values: AdminPlatformSettingsFormValues,
  mutateAsync: ReturnType<typeof useUpdateAdminPlatformSettings>['mutateAsync'],
  setError: UseFormSetError<AdminPlatformSettingsFormValues>,
): Promise<void> {
  try {
    await mutateAsync({
      privacyPolicyUrl: values.privacyPolicyUrl.length === 0 ? null : values.privacyPolicyUrl,
      termsOfServiceUrl: values.termsOfServiceUrl.length === 0 ? null : values.termsOfServiceUrl,
      aboutMission: values.aboutMission.length === 0 ? null : values.aboutMission,
      authCoverMediaUrl: values.authCoverMediaUrl.length === 0 ? null : values.authCoverMediaUrl,
    });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      for (const item of error.validationErrorObjects) {
        const fieldName = item.property as keyof AdminPlatformSettingsFormValues;
        if (
          fieldName !== 'privacyPolicyUrl' &&
          fieldName !== 'termsOfServiceUrl' &&
          fieldName !== 'aboutMission' &&
          fieldName !== 'authCoverMediaUrl'
        ) {
          continue;
        }
        const firstConstraint: string | undefined = Object.values(item.constraints)[0];
        if (firstConstraint !== undefined) {
          setError(fieldName, { message: firstConstraint });
        }
      }
    }
    setError('root', { message: getUserFacingErrorMessage(error) });
  }
}
