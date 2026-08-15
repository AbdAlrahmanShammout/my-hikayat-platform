import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CollectionBookRepoInput,
  CollectionPage,
  CreateCollectionRepoInput,
  ListCollectionsRepoInput,
  UpdateCollectionRepoInput,
} from '@/modules/collection/defs/collection-repository.defs';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionMapper } from '@/modules/collection/mapper/collection.mapper';
import { CollectionRepository } from '@/modules/collection/repository/collection.repository';
import { collectionDetailsInclude } from '@/modules/collection/types/collection-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import {
  PrismaClientLike,
  resolvePrismaTransactionClient,
} from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class CollectionPrismaRepository implements CollectionRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateCollectionRepoInput,
    context?: TransactionContext,
  ): Promise<CollectionEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.collection.create({
      data: {
        title: input.title,
        items: CollectionPrismaRepository.buildItemCreate(input.books),
      },
      include: collectionDetailsInclude,
    });
    return CollectionMapper.toEntity(result);
  }

  async update(
    input: UpdateCollectionRepoInput,
    context?: TransactionContext,
  ): Promise<CollectionEntity> {
    if (input.books !== undefined && context === undefined) {
      return this.prismaProviderService.$transaction(async (transactionClient) => {
        return CollectionPrismaRepository.writeUpdate(transactionClient, input);
      });
    }
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    return CollectionPrismaRepository.writeUpdate(client, input);
  }

  async delete(id: number, context?: TransactionContext): Promise<CollectionEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.collection.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: collectionDetailsInclude,
    });
    return CollectionMapper.toEntity(result);
  }

  async findById(id: number): Promise<CollectionEntity | null> {
    const result = await this.prismaProviderService.collection.findFirst({
      where: { id, deletedAt: null },
      include: collectionDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return CollectionMapper.toEntity(result);
  }

  async list(input: ListCollectionsRepoInput): Promise<CollectionPage> {
    const where: Prisma.CollectionWhereInput = { deletedAt: null };
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.collection.findMany({
        where,
        include: collectionDetailsInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.collection.count({ where }),
    ]);
    return {
      entities: rows.map((row) => CollectionMapper.toEntity(row)),
      total,
    };
  }

  private static async writeUpdate(
    client: PrismaClientLike,
    input: UpdateCollectionRepoInput,
  ): Promise<CollectionEntity> {
    if (input.books !== undefined) {
      await client.collectionBook.deleteMany({ where: { collectionId: input.id } });
      if (input.books.length > 0) {
        await client.collectionBook.createMany({
          data: input.books.map((book) => ({
            collectionId: input.id,
            bookId: book.bookId,
            displayOrder: book.displayOrder,
          })),
        });
      }
    }
    const data: Prisma.CollectionUpdateInput = {};
    if (input.title !== undefined) {
      data.title = input.title;
    }
    const result = await client.collection.update({
      where: { id: input.id },
      data,
      include: collectionDetailsInclude,
    });
    return CollectionMapper.toEntity(result);
  }

  private static buildItemCreate(
    books: readonly CollectionBookRepoInput[],
  ): Prisma.CollectionBookCreateNestedManyWithoutCollectionInput | undefined {
    if (books.length === 0) {
      return undefined;
    }
    return {
      create: books.map((book) => ({
        book: { connect: { id: book.bookId } },
        displayOrder: book.displayOrder,
      })),
    };
  }
}
