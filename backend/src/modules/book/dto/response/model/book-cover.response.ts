import { ApiProperty } from '@nestjs/swagger';

import { BookCatalogCover } from '@/modules/book-asset/defs/book-asset-service.defs';

/**
 * Time-limited catalog cover image for reader discovery. Not entitlement-gated.
 */
export class BookCoverResponse {
  @ApiProperty({
    description: 'Signed HTTPS URL for the catalog preview image',
    example: 'https://cdn.example.com/books/8/preview/cover.jpg?X-Amz-Signature=…',
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

  constructor(cover: BookCatalogCover) {
    this.url = cover.url;
    this.expiresAt = cover.expiresAt;
    this.contentType = cover.contentType;
  }
}
