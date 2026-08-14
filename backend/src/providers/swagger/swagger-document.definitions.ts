import type { Type } from '@nestjs/common';

import { AdminApiModule } from '@/modules/admin-api.module';
import { AuthorApiModule } from '@/modules/author-api.module';
import { ReaderApiModule } from '@/modules/reader-api.module';

import {
  SWAGGER_ADMIN_DISPLAY_NAME,
  SWAGGER_ADMIN_JSON_PATH,
  SWAGGER_AUTHOR_DISPLAY_NAME,
  SWAGGER_AUTHOR_JSON_PATH,
  SWAGGER_READER_DISPLAY_NAME,
  SWAGGER_READER_JSON_PATH,
} from './consts';

export type SwaggerDocumentDefinition = {
  readonly name: string;
  readonly titleSuffix: string;
  readonly description: string;
  readonly jsonPath: string;
  readonly include: readonly Type<unknown>[];
  readonly hasBearerAuth: boolean;
};

export const SWAGGER_DOCUMENT_DEFINITIONS: readonly SwaggerDocumentDefinition[] = [
  {
    name: 'reader',
    titleSuffix: SWAGGER_READER_DISPLAY_NAME,
    description: 'Catalog, reading, search, and subscription endpoints for readers.',
    jsonPath: SWAGGER_READER_JSON_PATH,
    include: [ReaderApiModule],
    hasBearerAuth: true,
  },
  {
    name: 'author',
    titleSuffix: SWAGGER_AUTHOR_DISPLAY_NAME,
    description: 'Upload, processing status, analytics, and earnings endpoints for authors.',
    jsonPath: SWAGGER_AUTHOR_JSON_PATH,
    include: [AuthorApiModule],
    hasBearerAuth: true,
  },
  {
    name: 'admin',
    titleSuffix: SWAGGER_ADMIN_DISPLAY_NAME,
    description:
      'Review, user, collection, subscription, and revenue endpoints for administrators.',
    jsonPath: SWAGGER_ADMIN_JSON_PATH,
    include: [AdminApiModule],
    hasBearerAuth: true,
  },
] as const;
