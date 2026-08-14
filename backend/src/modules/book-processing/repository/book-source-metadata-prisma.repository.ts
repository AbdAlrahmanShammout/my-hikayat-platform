import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateBookSourceMetadataRepoInput,
  UpdateBookSourceMetadataRepoInput,
} from '@/modules/book-processing/defs/book-source-metadata-repository.defs';
import { BookSourceMetadataEntity } from '@/modules/book-processing/entity/book-source-metadata.entity';
import { BookSourceMetadataMapper } from '@/modules/book-processing/mapper/book-source-metadata.mapper';
import { BookSourceMetadataRepository } from '@/modules/book-processing/repository/book-source-metadata.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class BookSourceMetadataPrismaRepository implements BookSourceMetadataRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateBookSourceMetadataRepoInput,
    context?: TransactionContext,
  ): Promise<BookSourceMetadataEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.bookSourceMetadata.create({
      data: {
        book: { connect: { id: input.bookId } },
        packagePath: input.packagePath,
        epubVersion: input.epubVersion,
        identifier: input.identifier,
        title: input.title,
        language: input.language,
        creator: input.creator,
        publisher: input.publisher,
        description: input.description,
      },
    });
    return BookSourceMetadataMapper.toEntity(result);
  }

  async update(
    input: UpdateBookSourceMetadataRepoInput,
    context?: TransactionContext,
  ): Promise<BookSourceMetadataEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.bookSourceMetadata.update({
      where: { id: input.id },
      data: {
        packagePath: input.packagePath,
        epubVersion: input.epubVersion,
        identifier: input.identifier,
        title: input.title,
        language: input.language,
        creator: input.creator,
        publisher: input.publisher,
        description: input.description,
      },
    });
    return BookSourceMetadataMapper.toEntity(result);
  }

  async findByBookId(bookId: number): Promise<BookSourceMetadataEntity | null> {
    const result = await this.prismaProviderService.bookSourceMetadata.findFirst({
      where: { bookId, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return BookSourceMetadataMapper.toEntity(result);
  }
}
