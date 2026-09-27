import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { COLLECTION_COVER } from '@/modules/collection/consts/collection-cover.constant';
import { COLLECTION_COVER_UPLOAD } from '@/modules/collection/consts/collection-cover-upload.constant';
import { CollectionService } from '@/modules/collection/collection.service';
import {
  ClearCollectionCoverServiceInput,
  CollectionCover,
  UploadCollectionCoverServiceInput,
} from '@/modules/collection/defs/collection-cover.defs';
import { CollectionResponse } from '@/modules/collection/dto/response/model/collection.response';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionInvalidCoverTypeException } from '@/modules/collection/exceptions/collection-invalid-cover-type.exception';
import { CollectionRepository } from '@/modules/collection/repository/collection.repository';
import {
  PutStorageObjectResult,
  StorageSignedUrl,
} from '@/providers/storage/defs/storage-manager.defs';
import { StorageManagerService } from '@/providers/storage/storage-manager.service';

@Injectable()
export class CollectionCoverService {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly collectionRepository: CollectionRepository,
    private readonly auditLogService: AuditLogService,
    private readonly transactionRunner: TransactionRunner,
    private readonly storageManagerService: StorageManagerService,
  ) {}

  /**
   * Stores a JPEG, PNG, or WebP cover and returns the updated collection.
   */
  async uploadCover(input: UploadCollectionCoverServiceInput): Promise<CollectionEntity> {
    const current: CollectionEntity = await this.collectionService.getCollectionById(
      input.collectionId,
    );
    CollectionCoverService.assertValidBody(input.body);
    const contentType: string = CollectionCoverService.resolveContentType(
      input.contentType,
      input.originalFileName,
    );
    const stored: PutStorageObjectResult = await this.storageManagerService.putObject({
      key: `collections/${current.id}/cover/${randomUUID()}`,
      body: input.body,
      contentType,
    });
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const updated: CollectionEntity = await this.collectionRepository.update(
        {
          id: current.id,
          coverStorageKey: stored.key,
          coverContentType: contentType,
        },
        context,
      );
      await this.auditLogService.append(
        {
          actorUserId: input.actorUserId,
          action: AuditAction.COLLECTION_UPDATED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: current.id,
          metadata: {
            fromCoverStorageKey: current.coverStorageKey,
            toCoverStorageKey: stored.key,
            contentType,
          },
        },
        context,
      );
      return updated;
    });
  }

  /**
   * Removes the stored cover. The collection is unchanged when none exists.
   */
  async clearCover(input: ClearCollectionCoverServiceInput): Promise<CollectionEntity> {
    const current: CollectionEntity = await this.collectionService.getCollectionById(
      input.collectionId,
    );
    if (current.coverStorageKey === null) {
      return current;
    }
    const previousKey: string = current.coverStorageKey;
    const updated: CollectionEntity = await this.transactionRunner.run(
      async (context: TransactionContext) => {
        const cleared: CollectionEntity = await this.collectionRepository.update(
          {
            id: current.id,
            coverStorageKey: null,
            coverContentType: null,
          },
          context,
        );
        await this.auditLogService.append(
          {
            actorUserId: input.actorUserId,
            action: AuditAction.COLLECTION_UPDATED,
            subjectType: AuditSubjectType.COLLECTION,
            subjectId: current.id,
            metadata: {
              fromCoverStorageKey: previousKey,
              toCoverStorageKey: null,
            },
          },
          context,
        );
        return cleared;
      },
    );
    await this.storageManagerService.deleteObject({ key: previousKey });
    return updated;
  }

  /**
   * Signs the stored cover when one exists.
   */
  async resolveCover(collection: CollectionEntity): Promise<CollectionCover | null> {
    if (collection.coverStorageKey === null || collection.coverContentType === null) {
      return null;
    }
    const signedUrl: StorageSignedUrl = await this.storageManagerService.createSignedGetUrl({
      key: collection.coverStorageKey,
      expiresInSeconds: COLLECTION_COVER.expiresInSeconds,
    });
    return {
      url: signedUrl.url,
      expiresAt: signedUrl.expiresAt,
      contentType: collection.coverContentType,
    };
  }

  /**
   * Signs covers for a page of collections.
   */
  async resolveCovers(
    collections: readonly CollectionEntity[],
  ): Promise<ReadonlyMap<number, CollectionCover | null>> {
    const entries: ReadonlyArray<readonly [number, CollectionCover | null]> = await Promise.all(
      collections.map(async (collection) => {
        const cover: CollectionCover | null = await this.resolveCover(collection);
        return [collection.id, cover] as const;
      }),
    );
    return new Map(entries);
  }

  /**
   * Builds one admin collection response with a signed cover URL.
   */
  async toCollectionResponse(entity: CollectionEntity): Promise<CollectionResponse> {
    const cover: CollectionCover | null = await this.resolveCover(entity);
    return new CollectionResponse(entity, cover);
  }

  /**
   * Builds admin collection responses with signed cover URLs.
   */
  async toCollectionResponses(
    entities: readonly CollectionEntity[],
  ): Promise<CollectionResponse[]> {
    const coverById: ReadonlyMap<number, CollectionCover | null> =
      await this.resolveCovers(entities);
    return entities.map(
      (entity) => new CollectionResponse(entity, coverById.get(entity.id) ?? null),
    );
  }

  private static assertValidBody(body: Buffer): void {
    if (body.byteLength === 0) {
      throw new InvalidStateException({
        message: 'Collection cover must not be empty',
        code: 'COLLECTION_EMPTY_COVER',
      });
    }
    if (body.byteLength > COLLECTION_COVER_UPLOAD.maxBytes) {
      throw new InvalidStateException({
        message: 'Collection cover exceeds the maximum allowed size',
        code: 'COLLECTION_COVER_TOO_LARGE',
      });
    }
  }

  private static resolveContentType(
    contentType: string,
    originalFileName: string | null | undefined,
  ): string {
    const normalizedContentType: string = contentType.trim().toLowerCase();
    if (normalizedContentType === 'image/jpeg' || normalizedContentType === 'image/jpg') {
      return 'image/jpeg';
    }
    if (normalizedContentType === 'image/png') {
      return 'image/png';
    }
    if (normalizedContentType === 'image/webp') {
      return 'image/webp';
    }
    return CollectionCoverService.resolveContentTypeFromName(originalFileName);
  }

  private static resolveContentTypeFromName(originalFileName: string | null | undefined): string {
    const normalizedName: string = (originalFileName ?? '').trim().toLowerCase();
    if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    if (normalizedName.endsWith('.png')) {
      return 'image/png';
    }
    if (normalizedName.endsWith('.webp')) {
      return 'image/webp';
    }
    throw new CollectionInvalidCoverTypeException();
  }
}
