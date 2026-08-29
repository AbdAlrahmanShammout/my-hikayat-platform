import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookAssetService } from '@/modules/book-asset/book-asset.service';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetContentKeyUnavailableException } from '@/modules/book-asset/exceptions/book-asset-content-key-unavailable.exception';
import { BookAssetEncryptedSourceMissingException } from '@/modules/book-asset/exceptions/book-asset-encrypted-source-missing.exception';
import { OfflineReadingLeaseService } from '@/modules/book-asset/offline-reading-lease.service';
import { EntitlementService } from '@/modules/entitlement/entitlement.service';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';

import { BookAssetContentKeyService } from './book-asset-content-key.service';

function createCatalogBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    ownerId: 4,
  });
}

function createSourceAsset(
  wrappedContentKey: Buffer | null = Buffer.from('wrapped'),
): BookAssetEntity {
  return new BookAssetEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.SOURCE,
    storageKey: 'books/8/source/uuid',
    contentType: 'application/epub+zip',
    byteSize: 32,
    checksumSha256: 'a'.repeat(64),
    originalFileName: 'book.epub',
    sortOrder: 0,
    isEncrypted: true,
    wrappedContentKey,
  });
}

function createOpenSession(): ReadingSessionEntity {
  return new ReadingSessionEntity({
    id: 12,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex: 0,
    scrollOffset: 0,
    spreadIndex: null,
    pageNumber: null,
  });
}

describe('BookAssetContentKeyService', () => {
  let mockBookService: { getCatalogBookById: jest.Mock };
  let mockBookAssetService: { findLatestBookAsset: jest.Mock };
  let mockEntitlementService: { assertFullBookReadingAccess: jest.Mock };
  let mockReadingSessionService: { getOwnedOpenReadingSession: jest.Mock };
  let mockEncryptionManagerService: { unwrapDataKey: jest.Mock };
  let mockAuditLogService: { append: jest.Mock };
  let mockOfflineReadingLeaseService: { issueLease: jest.Mock };
  let bookAssetContentKeyService: BookAssetContentKeyService;

  beforeEach(() => {
    mockBookService = { getCatalogBookById: jest.fn() };
    mockBookAssetService = { findLatestBookAsset: jest.fn() };
    mockEntitlementService = { assertFullBookReadingAccess: jest.fn() };
    mockReadingSessionService = { getOwnedOpenReadingSession: jest.fn() };
    mockEncryptionManagerService = { unwrapDataKey: jest.fn() };
    mockAuditLogService = { append: jest.fn() };
    mockOfflineReadingLeaseService = { issueLease: jest.fn() };
    bookAssetContentKeyService = new BookAssetContentKeyService(
      mockBookService as unknown as BookService,
      mockBookAssetService as unknown as BookAssetService,
      mockEntitlementService as unknown as EntitlementService,
      mockReadingSessionService as unknown as ReadingSessionService,
      mockEncryptionManagerService as unknown as EncryptionManagerService,
      mockAuditLogService as unknown as AuditLogService,
      mockOfflineReadingLeaseService as unknown as OfflineReadingLeaseService,
    );
  });

  it('issues a plain DEK for an entitled open session and audits issuance', async () => {
    const dataKey = Buffer.alloc(32, 9);
    mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
    mockReadingSessionService.getOwnedOpenReadingSession.mockResolvedValue(createOpenSession());
    mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset());
    mockEncryptionManagerService.unwrapDataKey.mockReturnValue({ dataKey, keyId: 'v1' });
    mockOfflineReadingLeaseService.issueLease.mockResolvedValue({
      version: 1,
      keyId: 'v1',
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
      accessKind: 'trial',
      issuedAt: new Date('2026-08-29T12:00:00.000Z'),
      expiresAt: new Date('2026-09-05T12:00:00.000Z'),
      signature: 'signed',
    });
    const actualKey = await bookAssetContentKeyService.createSourceContentKey({
      bookId: 8,
      userId: 5,
      sessionId: 12,
    });
    expect(mockEntitlementService.assertFullBookReadingAccess).toHaveBeenCalledWith(5);
    expect(mockReadingSessionService.getOwnedOpenReadingSession).toHaveBeenCalledWith({
      id: 12,
      userId: 5,
      bookId: 8,
    });
    expect(actualKey.key).toBe(dataKey.toString('base64'));
    expect(actualKey.algorithm).toBe('aes-256-gcm');
    expect(actualKey.keyDelivery).toBe('plain');
    expect(actualKey.keyId).toBe('v1');
    expect(actualKey.offlineLease.signature).toBe('signed');
    expect(mockOfflineReadingLeaseService.issueLease).toHaveBeenCalledWith({
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
    });
    expect(mockAuditLogService.append).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 5,
        action: AuditAction.BOOK_CONTENT_KEY_ISSUED,
        subjectType: AuditSubjectType.BOOK,
        subjectId: 8,
        metadata: expect.objectContaining({
          bookAssetId: 9,
          sessionId: 12,
          keyId: 'v1',
          offlineLeaseAccessKind: 'trial',
          offlineLeaseExpiresAt: '2026-09-05T12:00:00.000Z',
        }),
      }),
    );
  });

  it('denies unpaid readers before looking up a session', async () => {
    mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
    mockEntitlementService.assertFullBookReadingAccess.mockRejectedValue(
      new FullBookAccessDeniedException(),
    );
    await expect(
      bookAssetContentKeyService.createSourceContentKey({
        bookId: 8,
        userId: 5,
        sessionId: 12,
      }),
    ).rejects.toBeInstanceOf(FullBookAccessDeniedException);
    expect(mockReadingSessionService.getOwnedOpenReadingSession).not.toHaveBeenCalled();
  });

  it('fails closed when the source has no wrapped content key', async () => {
    mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
    mockReadingSessionService.getOwnedOpenReadingSession.mockResolvedValue(createOpenSession());
    mockBookAssetService.findLatestBookAsset.mockResolvedValue(createSourceAsset(null));
    await expect(
      bookAssetContentKeyService.createSourceContentKey({
        bookId: 8,
        userId: 5,
        sessionId: 12,
      }),
    ).rejects.toBeInstanceOf(BookAssetContentKeyUnavailableException);
    expect(mockEncryptionManagerService.unwrapDataKey).not.toHaveBeenCalled();
  });

  it('fails when the encrypted source is missing', async () => {
    mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
    mockReadingSessionService.getOwnedOpenReadingSession.mockResolvedValue(createOpenSession());
    mockBookAssetService.findLatestBookAsset.mockResolvedValue(null);
    await expect(
      bookAssetContentKeyService.createSourceContentKey({
        bookId: 8,
        userId: 5,
        sessionId: 12,
      }),
    ).rejects.toBeInstanceOf(BookAssetEncryptedSourceMissingException);
  });
});
