import { AdminApiModule } from '@/modules/admin-api.module';
import { AuthorApiModule } from '@/modules/author-api.module';
import { ReaderApiModule } from '@/modules/reader-api.module';

import { SWAGGER_DOCUMENT_DEFINITIONS } from './swagger-document.definitions';

describe('SWAGGER_DOCUMENT_DEFINITIONS', () => {
  it('declares one OpenAPI document per API audience', () => {
    expect(SWAGGER_DOCUMENT_DEFINITIONS.map((definition) => definition.name)).toEqual([
      'reader',
      'author',
      'admin',
    ]);
    expect(SWAGGER_DOCUMENT_DEFINITIONS[0].include).toEqual([ReaderApiModule]);
    expect(SWAGGER_DOCUMENT_DEFINITIONS[1].include).toEqual([AuthorApiModule]);
    expect(SWAGGER_DOCUMENT_DEFINITIONS[2].include).toEqual([AdminApiModule]);
    expect(SWAGGER_DOCUMENT_DEFINITIONS.every((definition) => definition.hasBearerAuth)).toBe(true);
  });
});
