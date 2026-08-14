import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

export class BookAssetResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Owning book id', example: 8 })
  bookId: number;

  @ApiProperty({
    description: 'Asset kind: source, processed, catalog media, or future audio',
    enum: BookAssetKind,
    example: BookAssetKind.SOURCE,
  })
  kind: BookAssetKind;

  @ApiProperty({
    description: 'Opaque object-storage key; not a public URL',
    example: 'books/8/source/original.epub',
  })
  storageKey: string;

  @ApiProperty({ description: 'MIME type', example: 'application/epub+zip' })
  contentType: string;

  @ApiProperty({ description: 'Stored object size in bytes', example: 1048576 })
  byteSize: number;

  @ApiPropertyOptional({
    description: 'SHA-256 hex digest of the stored object',
    example: 'a'.repeat(64),
    nullable: true,
  })
  checksumSha256: string | null;

  @ApiPropertyOptional({
    description: 'Original filename supplied at upload',
    example: 'the-last-lighthouse.epub',
    nullable: true,
  })
  originalFileName: string | null;

  @ApiProperty({ description: 'Display order among assets of the same kind', example: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Whether the stored object is encrypted', example: true })
  isEncrypted: boolean;

  constructor(entity: BookAssetEntity) {
    super(entity);
    this.bookId = entity.bookId;
    this.kind = entity.kind;
    this.storageKey = entity.storageKey;
    this.contentType = entity.contentType;
    this.byteSize = entity.byteSize;
    this.checksumSha256 = entity.checksumSha256;
    this.originalFileName = entity.originalFileName;
    this.sortOrder = entity.sortOrder;
    this.isEncrypted = entity.isEncrypted;
  }
}
