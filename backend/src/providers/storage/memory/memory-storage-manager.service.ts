import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { DEFAULT_STORAGE_CONTENT_TYPE } from '@/providers/storage/consts';
import {
  CreateStorageSignedUrlInput,
  DeleteStorageObjectInput,
  GetStorageObjectInput,
  GetStorageObjectResult,
  PutStorageObjectInput,
  PutStorageObjectResult,
  StorageSignedUrl,
} from '@/providers/storage/defs/storage-manager.defs';
import { StorageObjectNotFoundException } from '@/providers/storage/exceptions/storage-object-not-found.exception';
import { MEMORY_STORAGE_URI_SCHEME } from '@/providers/storage/memory/consts';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

type MemoryStoredObject = {
  readonly body: Buffer;
  readonly contentType: string;
};

@Injectable()
export class MemoryStorageManagerService extends StorageManagerService implements OnModuleDestroy {
  private readonly objects = new Map<string, MemoryStoredObject>();

  async putObject(input: PutStorageObjectInput): Promise<PutStorageObjectResult> {
    await Promise.resolve();
    const key: string = this.normalizeKey(input.key);
    const contentType: string = MemoryStorageManagerService.normalizeContentType(input.contentType);
    const body: Buffer = Buffer.from(input.body);
    this.objects.set(key, { body, contentType });
    return { key, byteSize: body.byteLength };
  }

  async getObject(input: GetStorageObjectInput): Promise<GetStorageObjectResult> {
    await Promise.resolve();
    const key: string = this.normalizeKey(input.key);
    const stored: MemoryStoredObject | undefined = this.objects.get(key);
    if (stored === undefined) {
      throw new StorageObjectNotFoundException(key);
    }
    const body: Buffer = Buffer.from(stored.body);
    return {
      key,
      body,
      contentType: stored.contentType,
      byteSize: body.byteLength,
    };
  }

  async deleteObject(input: DeleteStorageObjectInput): Promise<void> {
    await Promise.resolve();
    const key: string = this.normalizeKey(input.key);
    this.objects.delete(key);
  }

  async createSignedGetUrl(input: CreateStorageSignedUrlInput): Promise<StorageSignedUrl> {
    await Promise.resolve();
    const key: string = this.normalizeKey(input.key);
    this.assertValidExpiresInSeconds(input.expiresInSeconds);
    const expiresAt: Date = new Date(Date.now() + input.expiresInSeconds * 1000);
    return {
      url: `${MEMORY_STORAGE_URI_SCHEME}://${encodeURIComponent(key)}`,
      expiresAt,
    };
  }

  onModuleDestroy(): void {
    this.objects.clear();
  }

  private static normalizeContentType(contentType: string): string {
    const normalizedContentType: string = contentType.trim();
    if (normalizedContentType.length === 0) {
      return DEFAULT_STORAGE_CONTENT_TYPE;
    }
    return normalizedContentType;
  }
}
