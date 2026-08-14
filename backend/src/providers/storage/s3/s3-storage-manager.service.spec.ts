import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { StorageConfigService } from '@/config/storage/storage-config.service';
import { StorageFailureException } from '@/providers/storage/exceptions/storage-failure.exception';
import { StorageObjectNotFoundException } from '@/providers/storage/exceptions/storage-object-not-found.exception';

import { S3StorageManagerService } from './s3-storage-manager.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

describe('S3StorageManagerService', () => {
  const mockStorageConfigService = {
    bucket: 'lib-app-books',
  };
  let mockS3Client: { send: jest.Mock; destroy: jest.Mock };
  let s3StorageManagerService: S3StorageManagerService;

  beforeEach(() => {
    mockS3Client = { send: jest.fn(), destroy: jest.fn() };
    mockGetSignedUrl.mockReset();
    s3StorageManagerService = new S3StorageManagerService(
      mockS3Client as unknown as S3Client,
      mockStorageConfigService as unknown as StorageConfigService,
    );
  });

  describe('putObject', () => {
    it('uploads an object to the configured bucket', async () => {
      mockS3Client.send.mockResolvedValue({});
      const actualResult = await s3StorageManagerService.putObject({
        key: '  books/8/source.epub  ',
        body: Buffer.from('epub-bytes'),
        contentType: 'application/epub+zip',
      });
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      const actualCommand = mockS3Client.send.mock.calls[0][0] as PutObjectCommand;
      expect(actualCommand.input).toEqual(
        expect.objectContaining({
          Bucket: 'lib-app-books',
          Key: 'books/8/source.epub',
          ContentType: 'application/epub+zip',
          ContentLength: 10,
        }),
      );
      expect(actualResult).toEqual({ key: 'books/8/source.epub', byteSize: 10 });
    });

    it('wraps SDK failures', async () => {
      mockS3Client.send.mockRejectedValue(new Error('network'));
      await expect(
        s3StorageManagerService.putObject({
          key: 'books/8/source.epub',
          body: Buffer.from('x'),
          contentType: 'application/epub+zip',
        }),
      ).rejects.toBeInstanceOf(StorageFailureException);
    });
  });

  describe('getObject', () => {
    it('reads object bytes and content type', async () => {
      mockS3Client.send.mockResolvedValue({
        Body: {
          transformToByteArray: (): Promise<Uint8Array> =>
            Promise.resolve(Uint8Array.from(Buffer.from('epub-bytes'))),
        },
        ContentType: 'application/epub+zip',
      });
      const actualObject = await s3StorageManagerService.getObject({ key: 'books/8/source.epub' });
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      expect(actualObject.body.toString()).toBe('epub-bytes');
      expect(actualObject.contentType).toBe('application/epub+zip');
      expect(actualObject.byteSize).toBe(10);
    });

    it('maps a missing object to StorageObjectNotFoundException', async () => {
      const missingError = new Error('missing');
      missingError.name = 'NoSuchKey';
      mockS3Client.send.mockRejectedValue(missingError);
      await expect(
        s3StorageManagerService.getObject({ key: 'books/8/source.epub' }),
      ).rejects.toBeInstanceOf(StorageObjectNotFoundException);
    });
  });

  describe('deleteObject', () => {
    it('deletes the object from the configured bucket', async () => {
      mockS3Client.send.mockResolvedValue({});
      await s3StorageManagerService.deleteObject({ key: 'books/8/source.epub' });
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
  });

  describe('createSignedGetUrl', () => {
    it('returns a signed URL and future expiry', async () => {
      mockGetSignedUrl.mockResolvedValue('https://storage.example.com/signed');
      const actualSignedUrl = await s3StorageManagerService.createSignedGetUrl({
        key: 'books/8/source.epub',
        expiresInSeconds: 60,
      });
      expect(mockGetSignedUrl).toHaveBeenCalledWith(mockS3Client, expect.any(GetObjectCommand), {
        expiresIn: 60,
      });
      expect(actualSignedUrl.url).toBe('https://storage.example.com/signed');
      expect(actualSignedUrl.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
