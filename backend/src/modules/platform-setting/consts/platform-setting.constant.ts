export const PRIVACY_POLICY_URL_KEY = 'privacy_policy_url';
export const TERMS_OF_SERVICE_URL_KEY = 'terms_of_service_url';
export const ABOUT_MISSION_KEY = 'about_mission';
export const AUTH_COVER_MEDIA_URL_KEY = 'auth_cover_media_url';

export const PLATFORM_SETTING_URL_MAX_LENGTH = 2048;
export const ABOUT_MISSION_MAX_LENGTH = 2000;

export const PLATFORM_SETTING_KEYS = [
  PRIVACY_POLICY_URL_KEY,
  TERMS_OF_SERVICE_URL_KEY,
  ABOUT_MISSION_KEY,
  AUTH_COVER_MEDIA_URL_KEY,
] as const;

export const PRIVACY_POLICY_URL_MAX_LENGTH = PLATFORM_SETTING_URL_MAX_LENGTH;
