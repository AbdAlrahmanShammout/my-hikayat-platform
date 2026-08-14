import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookAssetPage,
  CreateBookAssetRepoInput,
  ListBookAssetsRepoInput,
  UpdateBookAssetRepoInput,
} from '@/modules/book-asset/defs/book-asset-repository.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetMapper } from '@/modules/book-asset/mapper/book-asset.mapper';
import { BookAssetRepository } from '@/modules/book-asset/repository/book-asset.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class BookAssetPrismaRepository implements BookAssetRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateBookAssetRepoInput,
    context?: TransactionContext,
  ): Promise<BookAssetEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.bookAsset.create({
      data: {
        book: { connect: { id: input.bookId } },
        kind: input.kind,
        storageKey: input.storageKey,
        contentType: input.contentType,
        byteSize: input.byteSize,
        checksumSha256: input.checksumSha256,
        originalFileName: input.originalFileName,
        sortOrder: input.sortOrder,
        isEncrypted: input.isEncrypted,
      },
    });
    return BookAssetMapper.toEntity(result);
  }

  async update(
    input: UpdateBookAssetRepoInput,
    context?: TransactionContext,
  ): Promise<BookAssetEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.BookAssetUpdateInput = {};
    if (input.storageKey !== undefined) {
      data.storageKey = input.storageKey;
    }
    if (input.contentType !== undefined) {
      data.contentType = input.contentType;
    }
    if (input.byteSize !== undefined) {
      data.byteSize = input.byteSize;
    }
    if (input.checksumSha256 !== undefined) {
      data.checksumSha256 = input.checksumSha256;
    }
    if (input.originalFileName !== undefined) {
      data.originalFileName = input.originalFileName;
    }
    if (input.sortOrder !== undefined) {
      data.sortOrder = input.sortOrder;
    }
    if (input.isEncrypted !== undefined) {
      data.isEncrypted = input.isEncrypted;
    }
    const result = await client.bookAsset.update({
      where: { id: input.id },
      data,
    });
    return BookAssetMapper.toEntity(result);
  }

  async findById(id: number): Promise<BookAssetEntity | null> {
    const result = await this.prismaProviderService.bookAsset.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return BookAssetMapper.toEntity(result);
  }

  async list(input: ListBookAssetsRepoInput): Promise<BookAssetPage> {
    const where: Prisma.BookAssetWhereInput = { deletedAt: null, bookId: input.bookId };
    if (input.kind !== undefined) {
      where.kind = input.kind;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.bookAsset.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.bookAsset.count({ where }),
    ]);
    return {
      entities: rows.map((row) => BookAssetMapper.toEntity(row)),
      total,
    };
  }
}
