export type PlatformSettingsSnapshot = {
  readonly privacyPolicyUrl: string | null;
  readonly termsOfServiceUrl: string | null;
  readonly aboutMission: string | null;
  readonly authCoverMediaUrl: string | null;
  readonly wordsPerPage: number;
};

export type UpdatePlatformSettingsServiceInput = {
  readonly privacyPolicyUrl?: string | null;
  readonly termsOfServiceUrl?: string | null;
  readonly aboutMission?: string | null;
  readonly authCoverMediaUrl?: string | null;
  readonly wordsPerPage?: number | null;
};
