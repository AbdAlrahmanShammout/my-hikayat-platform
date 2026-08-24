import { ApiProperty } from '@nestjs/swagger';

import { BookAssetContentKey } from '@/modules/book-asset/defs/book-asset-service.defs';

export class CreateBookAssetContentKeyResponseDto {
  @ApiProperty({ description: 'Catalog book id', example: 8 })
  bookId: number;

  @ApiProperty({ description: 'Encrypted source asset id', example: 9 })
  bookAssetId: number;

  @ApiProperty({ description: 'Open reading session that authorized this key', example: 12 })
  sessionId: number;

  @ApiProperty({
    description: 'Master KEK id that wrapped the per-asset content key',
    example: 'v1',
  })
  keyId: string;

  @ApiProperty({ description: 'Content encryption algorithm', example: 'aes-256-gcm' })
  algorithm: 'aes-256-gcm';

  @ApiProperty({
    description: 'How the content key is delivered; R3 uses plain base64 DEK bytes',
    example: 'plain',
  })
  keyDelivery: 'plain';

  @ApiProperty({
    description: 'Base64-encoded per-asset data encryption key (DEK). Never the master KEK.',
    example: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  })
  key: string;

  @ApiProperty({
    description: 'Advisory expiry for this key issuance',
    example: '2026-08-25T12:10:00.000Z',
  })
  expiresAt: Date;

  constructor(contentKey: BookAssetContentKey) {
    this.bookId = contentKey.bookId;
    this.bookAssetId = contentKey.bookAssetId;
    this.sessionId = contentKey.sessionId;
    this.keyId = contentKey.keyId;
    this.algorithm = contentKey.algorithm;
    this.keyDelivery = contentKey.keyDelivery;
    this.key = contentKey.key;
    this.expiresAt = contentKey.expiresAt;
  }
}
