import { Environment } from '@/config/environment';

export const SWAGGER_UI_PATH = 'docs';
export const SWAGGER_API_TITLE = 'E-Book Platform';
export const SWAGGER_DOCUMENT_VERSION = '1.0';
export const SWAGGER_READER_JSON_PATH = 'docs/reader-json';
export const SWAGGER_AUTHOR_JSON_PATH = 'docs/author-json';
export const SWAGGER_ADMIN_JSON_PATH = 'docs/admin-json';
export const SWAGGER_READER_DISPLAY_NAME = 'Reader';
export const SWAGGER_AUTHOR_DISPLAY_NAME = 'Author';
export const SWAGGER_ADMIN_DISPLAY_NAME = 'Admin';
export const SWAGGER_ENABLED_ENVIRONMENTS: readonly Environment[] = [
  Environment.DEVELOPMENT,
  Environment.STAGING,
];
