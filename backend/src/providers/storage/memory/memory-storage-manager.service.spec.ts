import { Test, TestingModule } from '@nestjs/testing';

import { DEFAULT_STORAGE_CONTENT_TYPE } from '@/providers/storage/consts';
import { StorageInvalidExpiresInException } from '@/providers/storage/exceptions/storage-invalid-expires-in.exception';
import { StorageInvalidKeyException } from '@/providers/storage/exceptions/storage-invalid-key.exception';
import { StorageObjectNotFoundException } from '@/providers/storage/exceptions/storage-object-not-found.exception';
import { MEMORY_STORAGE_URI_SCHEME } from '@/providers/storage/memory/consts';
import { MemoryStorageManagerService } from '@/providers/storage/memory/memory-storage-manager.service';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

describe('MemoryStorageManagerService', () => {
  let storageManagerService: StorageManagerService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [{ provide: StorageManagerService, useClass: MemoryStorageManagerService }],
    }).compile();
    storageManagerService = moduleRef.get(StorageManagerService);
  });

  describe('putObject and getObject', () => {
    it('stores an object and returns an isolated copy on read', async () => {
      const inputBody = Buffer.from('epub-bytes');
      const putResult = await storageManagerService.putObject({
        key: '  books/8/source.epub  ',
        body: inputBody,
        contentType: '  application/epub+zip  ',
      });
      inputBody.write('xxxxxxxx', 0);
      expect(putResult).toEqual({ key: 'books/8/source.epub', byteSize: 10 });
      const actualObject = await storageManagerService.getObject({ key: 'books/8/source.epub' });
      expect(actualObject.contentType).toBe('application/epub+zip');
      expect(actualObject.byteSize).toBe(10);
      expect(actualObject.body.toString()).toBe('epub-bytes');
      actualObject.body.write('yyyyyyyyyy', 0);
      const rereadObject = await storageManagerService.getObject({ key: 'books/8/source.epub' });
      expect(rereadObject.body.toString()).toBe('epub-bytes');
    });

    it('defaults an empty content type to octet-stream', async () => {
      await storageManagerService.putObject({
        key: 'books/8/source.epub',
        body: Buffer.from('x'),
        contentType: '   ',
      });
      const actualObject = await storageManagerService.getObject({ key: 'books/8/source.epub' });
      expect(actualObject.contentType).toBe(DEFAULT_STORAGE_CONTENT_TYPE);
    });

    it('overwrites an existing key', async () => {
      await storageManagerService.putObject({
        key: 'books/8/source.epub',
        body: Buffer.from('first'),
        contentType: 'application/epub+zip',
      });
      await storageManagerService.putObject({
        key: 'books/8/source.epub',
        body: Buffer.from('second'),
        contentType: 'application/epub+zip',
      });
      const actualObject = await storageManagerService.getObject({ key: 'books/8/source.epub' });
      expect(actualObject.body.toString()).toBe('second');
    });

    it('throws when the object is missing', async () => {
      await expect(storageManagerService.getObject({ key: 'missing' })).rejects.toBeInstanceOf(
        StorageObjectNotFoundException,
      );
    });

    it('rejects a key with a leading slash', async () => {
      await expect(
        storageManagerService.putObject({
          key: '/books/8/source.epub',
          body: Buffer.from('x'),
          contentType: 'application/epub+zip',
        }),
      ).rejects.toBeInstanceOf(StorageInvalidKeyException);
    });

    it('rejects an empty key', async () => {
      await expect(
        storageManagerService.putObject({
          key: '   ',
          body: Buffer.from('x'),
          contentType: 'application/epub+zip',
        }),
      ).rejects.toBeInstanceOf(StorageInvalidKeyException);
    });
  });

  describe('deleteObject', () => {
    it('removes a stored object', async () => {
      await storageManagerService.putObject({
        key: 'books/8/source.epub',
        body: Buffer.from('x'),
        contentType: 'application/epub+zip',
      });
      await storageManagerService.deleteObject({ key: 'books/8/source.epub' });
      await expect(
        storageManagerService.getObject({ key: 'books/8/source.epub' }),
      ).rejects.toBeInstanceOf(StorageObjectNotFoundException);
    });

    it('succeeds when the object is already absent', async () => {
      await expect(
        storageManagerService.deleteObject({ key: 'books/8/source.epub' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('createSignedGetUrl', () => {
    it('returns a memory URI and future expiry', async () => {
      const actualSignedUrl = await storageManagerService.createSignedGetUrl({
        key: 'books/8/source.epub',
        expiresInSeconds: 60,
      });
      expect(actualSignedUrl.url).toBe(
        `${MEMORY_STORAGE_URI_SCHEME}://${encodeURIComponent('books/8/source.epub')}`,
      );
      expect(actualSignedUrl.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('rejects a non-positive expiry', async () => {
      await expect(
        storageManagerService.createSignedGetUrl({
          key: 'books/8/source.epub',
          expiresInSeconds: 0,
        }),
      ).rejects.toBeInstanceOf(StorageInvalidExpiresInException);
    });
  });
});
