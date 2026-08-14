import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { StorageConfigService } from './storage-config.service';

describe('StorageConfigService', () => {
  let storageConfigService: StorageConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [StorageConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    storageConfigService = moduleRef.get(StorageConfigService);
  });

  describe('bucket', () => {
    it('returns the configured bucket name', () => {
      mockConfigService.get.mockReturnValue('lib-app-books');
      const actualBucket: string = storageConfigService.bucket;
      expect(actualBucket).toBe('lib-app-books');
      expect(mockConfigService.get).toHaveBeenCalledWith('storage.bucket');
    });
  });

  describe('region', () => {
    it('returns the configured region', () => {
      mockConfigService.get.mockReturnValue('us-east-1');
      const actualRegion: string = storageConfigService.region;
      expect(actualRegion).toBe('us-east-1');
      expect(mockConfigService.get).toHaveBeenCalledWith('storage.region');
    });
  });

  describe('endpoint', () => {
    it('returns a custom S3-compatible endpoint when configured', () => {
      mockConfigService.get.mockReturnValue('https://storage.example.com');
      const actualEndpoint: string | null = storageConfigService.endpoint;
      expect(actualEndpoint).toBe('https://storage.example.com');
      expect(mockConfigService.get).toHaveBeenCalledWith('storage.endpoint');
    });
  });

  describe('accessKeyId', () => {
    it('returns the configured access key id', () => {
      mockConfigService.get.mockReturnValue('access-key');
      const actualAccessKeyId: string = storageConfigService.accessKeyId;
      expect(actualAccessKeyId).toBe('access-key');
      expect(mockConfigService.get).toHaveBeenCalledWith('storage.accessKeyId');
    });
  });

  describe('secretAccessKey', () => {
    it('returns the configured secret access key', () => {
      mockConfigService.get.mockReturnValue('secret-key');
      const actualSecretAccessKey: string = storageConfigService.secretAccessKey;
      expect(actualSecretAccessKey).toBe('secret-key');
      expect(mockConfigService.get).toHaveBeenCalledWith('storage.secretAccessKey');
    });
  });

  describe('forcePathStyle', () => {
    it('returns whether path-style addressing is enabled', () => {
      mockConfigService.get.mockReturnValue(true);
      const actualForcePathStyle: boolean = storageConfigService.forcePathStyle;
      expect(actualForcePathStyle).toBe(true);
      expect(mockConfigService.get).toHaveBeenCalledWith('storage.forcePathStyle');
    });
  });
});
