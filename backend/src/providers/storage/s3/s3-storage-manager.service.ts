import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { StorageConfigService } from '@/config/storage/storage-config.service';
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
import { StorageFailureException } from '@/providers/storage/exceptions/storage-failure.exception';
import { StorageObjectNotFoundException } from '@/providers/storage/exceptions/storage-object-not-found.exception';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

type TransformableBody = {
  readonly transformToByteArray: () => Promise<Uint8Array>;
};

@Injectable()
export class S3StorageManagerService extends StorageManagerService implements OnModuleDestroy {
  constructor(
    private readonly s3Client: S3Client,
    private readonly storageConfigService: StorageConfigService,
  ) {
    super();
  }

  async putObject(input: PutStorageObjectInput): Promise<PutStorageObjectResult> {
    const key: string = this.normalizeKey(input.key);
    const contentType: string = S3StorageManagerService.normalizeContentType(input.contentType);
    const body: Buffer = Buffer.from(input.body);
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.storageConfigService.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ContentLength: body.byteLength,
        }),
      );
    } catch (err: unknown) {
      throw S3StorageManagerService.translateError(err, key);
    }
    return { key, byteSize: body.byteLength };
  }

  async getObject(input: GetStorageObjectInput): Promise<GetStorageObjectResult> {
    const key: string = this.normalizeKey(input.key);
    try {
      const result = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.storageConfigService.bucket,
          Key: key,
        }),
      );
      const body: Buffer = await S3StorageManagerService.readBody(result.Body, key);
      return {
        key,
        body,
        contentType: result.ContentType ?? DEFAULT_STORAGE_CONTENT_TYPE,
        byteSize: body.byteLength,
      };
    } catch (err: unknown) {
      throw S3StorageManagerService.translateError(err, key);
    }
  }

  async deleteObject(input: DeleteStorageObjectInput): Promise<void> {
    const key: string = this.normalizeKey(input.key);
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.storageConfigService.bucket,
          Key: key,
        }),
      );
    } catch (err: unknown) {
      throw S3StorageManagerService.translateError(err, key);
    }
  }

  async createSignedGetUrl(input: CreateStorageSignedUrlInput): Promise<StorageSignedUrl> {
    const key: string = this.normalizeKey(input.key);
    this.assertValidExpiresInSeconds(input.expiresInSeconds);
    try {
      const url: string = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: this.storageConfigService.bucket,
          Key: key,
        }),
        { expiresIn: input.expiresInSeconds },
      );
      return {
        url,
        expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000),
      };
    } catch (err: unknown) {
      throw S3StorageManagerService.translateError(err, key);
    }
  }

  onModuleDestroy(): void {
    this.s3Client.destroy();
  }

  private static normalizeContentType(contentType: string): string {
    const normalizedContentType: string = contentType.trim();
    if (normalizedContentType.length === 0) {
      return DEFAULT_STORAGE_CONTENT_TYPE;
    }
    return normalizedContentType;
  }

  private static async readBody(body: unknown, key: string): Promise<Buffer> {
    if (!S3StorageManagerService.isTransformableBody(body)) {
      throw new StorageObjectNotFoundException(key);
    }
    const bytes: Uint8Array = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  private static isTransformableBody(body: unknown): body is TransformableBody {
    return (
      body !== null &&
      typeof body === 'object' &&
      'transformToByteArray' in body &&
      typeof body.transformToByteArray === 'function'
    );
  }

  private static translateError(err: unknown, key: string): Error {
    if (err instanceof StorageObjectNotFoundException || err instanceof StorageFailureException) {
      return err;
    }
    if (S3StorageManagerService.isMissingObjectError(err)) {
      return new StorageObjectNotFoundException(key);
    }
    return new StorageFailureException();
  }

  private static isMissingObjectError(err: unknown): boolean {
    if (!(err instanceof Error)) {
      return false;
    }
    return err.name === 'NoSuchKey' || err.name === 'NotFound';
  }
}
