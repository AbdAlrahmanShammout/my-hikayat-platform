import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  CreateBookPageTextLayerRepoInput,
  CreateBookPageTextRunRepoInput,
  ReplaceBookPageTextLayersRepoInput,
} from '@/modules/book-processing/defs/book-page-text-layer-repository.defs';
import { BookPageTextLayerEntity } from '@/modules/book-processing/entity/book-page-text-layer.entity';
import { BookPageTextLayerMapper } from '@/modules/book-processing/mapper/book-page-text-layer.mapper';
import { BookPageTextLayerRepository } from '@/modules/book-processing/repository/book-page-text-layer.repository';
import { BookPageTextLayerType } from '@/modules/book-processing/types/book-page-text-layer-details-schema.type';
import { BookPageTextRunType } from '@/modules/book-processing/types/book-page-text-run-details-schema.type';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

type BookPageTextLayerRow = BookPageTextLayerType & {
  readonly runs: readonly BookPageTextRunType[];
};

const TEXT_LAYER_RUNS_INCLUDE = {
  runs: { orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }] },
};

@Injectable()
export class BookPageTextLayerPrismaRepository implements BookPageTextLayerRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async replaceByBookId(
    input: ReplaceBookPageTextLayersRepoInput,
  ): Promise<BookPageTextLayerEntity[]> {
    const rows: BookPageTextLayerRow[] = await this.prismaProviderService.$transaction(
      async (transactionClient) => {
        await transactionClient.bookPageTextLayer.deleteMany({ where: { bookId: input.bookId } });
        return Promise.all(
          input.layers.map((layer) =>
            transactionClient.bookPageTextLayer.create({
              data: BookPageTextLayerPrismaRepository.toCreateData(input.bookId, layer),
              include: TEXT_LAYER_RUNS_INCLUDE,
            }),
          ),
        );
      },
    );
    return rows.map((row) => BookPageTextLayerMapper.toEntity(row));
  }

  async listByBookId(bookId: number): Promise<BookPageTextLayerEntity[]> {
    const rows: BookPageTextLayerRow[] =
      await this.prismaProviderService.bookPageTextLayer.findMany({
        where: { bookId, deletedAt: null },
        include: TEXT_LAYER_RUNS_INCLUDE,
        orderBy: [{ id: 'asc' }],
      });
    return rows.map((row) => BookPageTextLayerMapper.toEntity(row));
  }

  private static toCreateData(
    bookId: number,
    layer: CreateBookPageTextLayerRepoInput,
  ): Prisma.BookPageTextLayerCreateInput {
    return {
      book: { connect: { id: bookId } },
      page: { connect: { id: layer.pageId } },
      contentText: layer.contentText,
      runs: {
        create: layer.runs.map((run) => BookPageTextLayerPrismaRepository.toRunCreateData(run)),
      },
    };
  }

  private static toRunCreateData(
    run: CreateBookPageTextRunRepoInput,
  ): Prisma.BookPageTextRunCreateWithoutTextLayerInput {
    return {
      sortOrder: run.sortOrder,
      text: run.text,
      x: run.x,
      y: run.y,
      width: run.width,
      height: run.height,
    };
  }
}
