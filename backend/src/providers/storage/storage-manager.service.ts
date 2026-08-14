import {
  CreateStorageSignedUrlInput,
  DeleteStorageObjectInput,
  GetStorageObjectInput,
  GetStorageObjectResult,
  PutStorageObjectInput,
  PutStorageObjectResult,
  StorageSignedUrl,
} from '@/providers/storage/defs/storage-manager.defs';
import { StorageInvalidExpiresInException } from '@/providers/storage/exceptions/storage-invalid-expires-in.exception';
import { StorageInvalidKeyException } from '@/providers/storage/exceptions/storage-invalid-key.exception';

export abstract class StorageManagerService {
  abstract putObject(input: PutStorageObjectInput): Promise<PutStorageObjectResult>;
  abstract getObject(input: GetStorageObjectInput): Promise<GetStorageObjectResult>;
  abstract deleteObject(input: DeleteStorageObjectInput): Promise<void>;
  abstract createSignedGetUrl(input: CreateStorageSignedUrlInput): Promise<StorageSignedUrl>;

  protected normalizeKey(key: string): string {
    const normalizedKey: string = key.trim();
    StorageManagerService.assertValidKey(normalizedKey);
    return normalizedKey;
  }

  protected assertValidExpiresInSeconds(expiresInSeconds: number): void {
    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0) {
      throw new StorageInvalidExpiresInException();
    }
  }

  private static assertValidKey(key: string): void {
    if (key.length === 0 || key.startsWith('/')) {
      throw new StorageInvalidKeyException(key);
    }
  }
}
