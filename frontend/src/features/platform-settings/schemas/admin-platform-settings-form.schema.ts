import { z } from 'zod';

export const AUTH_COVER_MEDIA_ASPECT_HINT =
  'Landscape looping GIF or muted MP4, about 16:9. A 3:1 strip also fits the Sign in cover area.';

export const adminPlatformSettingsFormSchema = z.object({
  privacyPolicyUrl: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^https?:\/\//i.test(value),
      'Enter an http or https URL, or leave blank to clear',
    ),
  termsOfServiceUrl: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^https?:\/\//i.test(value),
      'Enter an http or https URL, or leave blank to clear',
    ),
  aboutMission: z
    .string()
    .trim()
    .max(2000, 'Use 2000 characters or fewer'),
  authCoverMediaUrl: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^https?:\/\//i.test(value),
      'Enter an http or https URL, or leave blank to clear',
    ),
});

export type AdminPlatformSettingsFormValues = z.infer<typeof adminPlatformSettingsFormSchema>;
