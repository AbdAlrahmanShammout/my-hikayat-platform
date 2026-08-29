import { ApiProperty } from '@nestjs/swagger';

import type {
  OfflineReadingLease,
  OfflineReadingLeaseAccessKind,
} from '@/modules/book-asset/defs/book-asset-service.defs';

export class OfflineReadingLeaseResponse {
  @ApiProperty({ description: 'Offline license format version', example: 1 })
  version: 1;

  @ApiProperty({ description: 'Offline lease signing key id', example: 'v1' })
  keyId: string;

  @ApiProperty({ description: 'Authorized reader user id', example: 5 })
  userId: number;

  @ApiProperty({ description: 'Authorized catalog book id', example: 8 })
  bookId: number;

  @ApiProperty({ description: 'Authorized encrypted source asset id', example: 9 })
  bookAssetId: number;

  @ApiProperty({
    description: 'Backend entitlement source for this offline lease',
    enum: ['trial', 'paid'],
    example: 'trial',
  })
  accessKind: OfflineReadingLeaseAccessKind;

  @ApiProperty({ description: 'Server time when the lease was issued' })
  issuedAt: Date;

  @ApiProperty({ description: 'Server-authoritative expiry for offline reading' })
  expiresAt: Date;

  @ApiProperty({ description: 'Ed25519 signature over the lease payload' })
  signature: string;

  constructor(lease: OfflineReadingLease) {
    this.version = lease.version;
    this.keyId = lease.keyId;
    this.userId = lease.userId;
    this.bookId = lease.bookId;
    this.bookAssetId = lease.bookAssetId;
    this.accessKind = lease.accessKind;
    this.issuedAt = lease.issuedAt;
    this.expiresAt = lease.expiresAt;
    this.signature = lease.signature;
  }
}
