import { Injectable } from '@nestjs/common';

import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BOOK_CONTENT_KEY } from '@/modules/book-asset/book-content-key.constant';
import {
  BookAssetContentKey,
  CreateBookAssetContentKeyServiceInput,
} from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetContentKeyUnavailableException } from '@/modules/book-asset/exceptions/book-asset-content-key-unavailable.exception';
import { BookAssetEncryptedSourceMissingException } from '@/modules/book-asset/exceptions/book-asset-encrypted-source-missing.exception';
import { BookAssetNotEncryptedException } from '@/modules/book-asset/exceptions/book-asset-not-encrypted.exception';
import { OfflineReadingLeaseService } from '@/modules/book-asset/offline-reading-lease.service';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { UnwrapDataKeyResult } from '@/providers/encryption/defs/encryption-manager.defs';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';

@Injectable()
export class BookAssetContentKeyService {
  constructor(
    private readonly bookService: BookService,
    private readonly bookAssetService: BookAssetService,
    private readonly entitlementService: EntitlementService,
    private readonly readingSessionService: ReadingSessionService,
    private readonly encryptionManagerService: EncryptionManagerService,
    private readonly auditLogService: AuditLogService,
    private readonly offlineReadingLeaseService: OfflineReadingLeaseService,
  ) {}

  async createSourceContentKey(
    input: CreateBookAssetContentKeyServiceInput,
  ): Promise<BookAssetContentKey> {
    await this.bookService.getCatalogBookById(input.bookId);
    await this.entitlementService.assertFullBookReadingAccess(input.userId);
    const session: ReadingSessionEntity =
      await this.readingSessionService.getOwnedOpenReadingSession({
        id: input.sessionId,
        userId: input.userId,
        bookId: input.bookId,
      });
    const source: BookAssetEntity = await this.requireEncryptedSource(input.bookId);
    if (source.wrappedContentKey === null) {
      throw new BookAssetContentKeyUnavailableException(source.id);
    }
    const unwrapped: UnwrapDataKeyResult = this.encryptionManagerService.unwrapDataKey({
      wrappedKey: source.wrappedContentKey,
    });
    const offlineLease = await this.offlineReadingLeaseService.issueLease({
      userId: input.userId,
      bookId: input.bookId,
      bookAssetId: source.id,
    });
    await this.auditLogService.append({
      actorUserId: input.userId,
      action: AuditAction.BOOK_CONTENT_KEY_ISSUED,
      subjectType: AuditSubjectType.BOOK,
      subjectId: input.bookId,
      metadata: {
        bookAssetId: source.id,
        sessionId: session.id,
        keyId: unwrapped.keyId,
        keyDelivery: BOOK_CONTENT_KEY.keyDelivery,
        offlineLeaseAccessKind: offlineLease.accessKind,
        offlineLeaseExpiresAt: offlineLease.expiresAt.toISOString(),
      },
    });
    return {
      bookId: input.bookId,
      bookAssetId: source.id,
      sessionId: session.id,
      keyId: unwrapped.keyId,
      algorithm: BOOK_CONTENT_KEY.algorithm,
      keyDelivery: BOOK_CONTENT_KEY.keyDelivery,
      key: unwrapped.dataKey.toString('base64'),
      expiresAt: new Date(Date.now() + BOOK_CONTENT_KEY.expiresInSeconds * 1000),
      offlineLease,
    };
  }

  private async requireEncryptedSource(bookId: number): Promise<BookAssetEntity> {
    const source: BookAssetEntity | null = await this.bookAssetService.findLatestBookAsset({
      bookId,
      kind: BookAssetKind.SOURCE,
    });
    if (source === null) {
      throw new BookAssetEncryptedSourceMissingException(bookId);
    }
    if (!source.isEncrypted) {
      throw new BookAssetNotEncryptedException(source.id);
    }
    return source;
  }
}
