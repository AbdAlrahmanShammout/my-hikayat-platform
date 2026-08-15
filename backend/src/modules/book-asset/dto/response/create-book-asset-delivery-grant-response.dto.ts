import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookAssetDeliveryGrant } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

export class CreateBookAssetDeliveryGrantResponseDto {
  @ApiProperty({ description: 'Catalog book id', example: 8 })
  bookId: number;

  @ApiProperty({ description: 'Encrypted source asset id', example: 9 })
  bookAssetId: number;

  @ApiProperty({
    description: 'Asset kind delivered by the grant',
    enum: BookAssetKind,
    example: BookAssetKind.SOURCE,
  })
  kind: BookAssetKind;

  @ApiProperty({
    description: 'Time-limited URL for the encrypted object; not a storage key',
    example: 'https://storage.example.com/books/8/source/encrypted',
  })
  url: string;

  @ApiProperty({
    description: 'When the delivery URL expires',
    example: '2026-08-15T16:05:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'MIME type of the stored encrypted object',
    example: 'application/epub+zip',
  })
  contentType: string;

  @ApiProperty({ description: 'Stored encrypted object size in bytes', example: 1048576 })
  byteSize: number;

  @ApiPropertyOptional({
    description: 'SHA-256 hex digest of the stored encrypted object',
    example: 'a'.repeat(64),
    nullable: true,
  })
  checksumSha256: string | null;

  @ApiProperty({ description: 'Whether the delivered object remains encrypted', example: true })
  isEncrypted: boolean;

  constructor(grant: BookAssetDeliveryGrant) {
    this.bookId = grant.bookId;
    this.bookAssetId = grant.bookAssetId;
    this.kind = grant.kind;
    this.url = grant.url;
    this.expiresAt = grant.expiresAt;
    this.contentType = grant.contentType;
    this.byteSize = grant.byteSize;
    this.checksumSha256 = grant.checksumSha256;
    this.isEncrypted = grant.isEncrypted;
  }
}
