import { ApiProperty } from '@nestjs/swagger';

import { CollectionCover } from '@/modules/collection/defs/collection-cover.defs';

/**
 * Time-limited collection cover image. Not entitlement-gated.
 */
export class CollectionCoverResponse {
  @ApiProperty({
    description: 'Signed HTTPS URL for the collection cover image',
    example: 'https://cdn.example.com/collections/3/cover/image.jpg?X-Amz-Signature=…',
  })
  url: string;

  @ApiProperty({
    description: 'When the signed cover URL expires',
    example: '2026-09-03T13:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Image content type',
    example: 'image/jpeg',
  })
  contentType: string;

  constructor(cover: CollectionCover) {
    this.url = cover.url;
    this.expiresAt = cover.expiresAt;
    this.contentType = cover.contentType;
  }
}
