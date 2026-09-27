import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { COLLECTION_COVER } from '@/modules/collection/consts/collection-cover.constant';
import { CollectionCoverService } from '@/modules/collection/collection-cover.service';
import { CollectionService } from '@/modules/collection/collection.service';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionInvalidCoverTypeException } from '@/modules/collection/exceptions/collection-invalid-cover-type.exception';
import { CollectionRepository } from '@/modules/collection/repository/collection.repository';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

describe('CollectionCoverService', () => {
  const actorUserId = 9;
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  let mockCollectionService: { getCollectionById: jest.Mock };
  let mockCollectionRepository: { update: jest.Mock };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let mockStorageManagerService: {
    putObject: jest.Mock;
    deleteObject: jest.Mock;
    createSignedGetUrl: jest.Mock;
  };
  let collectionCoverService: CollectionCoverService;

  function createCollection(coverStorageKey: string | null = null): CollectionEntity {
    return new CollectionEntity({
      id: 3,
      createdAt,
      updatedAt: createdAt,
      title: 'Harbor Picks',
      coverStorageKey,
      coverContentType: coverStorageKey === null ? null : 'image/png',
    });
  }

  beforeEach(() => {
    mockCollectionService = { getCollectionById: jest.fn() };
    mockCollectionRepository = { update: jest.fn() };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn((work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    mockStorageManagerService = {
      putObject: jest.fn(),
      deleteObject: jest.fn(),
      createSignedGetUrl: jest.fn(),
    };
    collectionCoverService = new CollectionCoverService(
      mockCollectionService as unknown as CollectionService,
      mockCollectionRepository as unknown as CollectionRepository,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
      mockStorageManagerService as unknown as StorageManagerService,
    );
  });

  it('stores a png cover and records the storage key', async () => {
    const current = createCollection();
    const updated = createCollection('collections/3/cover/stored.png');
    mockCollectionService.getCollectionById.mockResolvedValue(current);
    mockStorageManagerService.putObject.mockResolvedValue({
      key: 'collections/3/cover/stored.png',
      byteSize: 4,
    });
    mockCollectionRepository.update.mockResolvedValue(updated);
    const actualEntity = await collectionCoverService.uploadCover({
      collectionId: 3,
      actorUserId,
      body: Buffer.from('png'),
      contentType: 'image/png',
      originalFileName: 'cover.png',
    });
    expect(mockStorageManagerService.putObject).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: 'image/png' }),
    );
    expect(mockCollectionRepository.update).toHaveBeenCalledWith(
      {
        id: 3,
        coverStorageKey: 'collections/3/cover/stored.png',
        coverContentType: 'image/png',
      },
      undefined,
    );
    expect(mockAuditLogService.append).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId,
        action: AuditAction.COLLECTION_UPDATED,
        subjectType: AuditSubjectType.COLLECTION,
        subjectId: 3,
      }),
      undefined,
    );
    expect(actualEntity).toBe(updated);
  });

  it('rejects a cover that is not an image', async () => {
    mockCollectionService.getCollectionById.mockResolvedValue(createCollection());
    await expect(
      collectionCoverService.uploadCover({
        collectionId: 3,
        actorUserId,
        body: Buffer.from('text'),
        contentType: 'text/plain',
        originalFileName: 'notes.txt',
      }),
    ).rejects.toBeInstanceOf(CollectionInvalidCoverTypeException);
    expect(mockStorageManagerService.putObject).not.toHaveBeenCalled();
  });

  it('rejects an empty cover', async () => {
    mockCollectionService.getCollectionById.mockResolvedValue(createCollection());
    await expect(
      collectionCoverService.uploadCover({
        collectionId: 3,
        actorUserId,
        body: Buffer.alloc(0),
        contentType: 'image/png',
      }),
    ).rejects.toBeInstanceOf(InvalidStateException);
    expect(mockStorageManagerService.putObject).not.toHaveBeenCalled();
  });

  it('clears a stored cover and deletes the object', async () => {
    const current = createCollection('collections/3/cover/stored.png');
    const cleared = createCollection();
    mockCollectionService.getCollectionById.mockResolvedValue(current);
    mockCollectionRepository.update.mockResolvedValue(cleared);
    const actualEntity = await collectionCoverService.clearCover({
      collectionId: 3,
      actorUserId,
    });
    expect(mockCollectionRepository.update).toHaveBeenCalledWith(
      { id: 3, coverStorageKey: null, coverContentType: null },
      undefined,
    );
    expect(mockStorageManagerService.deleteObject).toHaveBeenCalledWith({
      key: 'collections/3/cover/stored.png',
    });
    expect(actualEntity).toBe(cleared);
  });

  it('signs a stored cover url', async () => {
    const expiresAt = new Date('2026-09-03T13:00:00.000Z');
    mockStorageManagerService.createSignedGetUrl.mockResolvedValue({
      url: 'https://cdn.example.com/cover.png',
      expiresAt,
    });
    const actualCover = await collectionCoverService.resolveCover(
      createCollection('collections/3/cover/stored.png'),
    );
    expect(mockStorageManagerService.createSignedGetUrl).toHaveBeenCalledWith({
      key: 'collections/3/cover/stored.png',
      expiresInSeconds: COLLECTION_COVER.expiresInSeconds,
    });
    expect(actualCover).toEqual({
      url: 'https://cdn.example.com/cover.png',
      expiresAt,
      contentType: 'image/png',
    });
  });

  it('returns null when the collection has no cover', async () => {
    const actualCover = await collectionCoverService.resolveCover(createCollection());
    expect(actualCover).toBeNull();
    expect(mockStorageManagerService.createSignedGetUrl).not.toHaveBeenCalled();
  });
});
